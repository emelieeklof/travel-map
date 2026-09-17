import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  Map,
  InfoWindow,
  Polyline,
  AdvancedMarker,
  Marker,
  useMap,
  useMapsLibrary,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps'
import {
  X,
  Trash2,
  Star,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  Footprints,
  ExternalLink,
  LocateFixed,
  Locate,
  LocateOff,
  Navigation,
} from 'lucide-react'
import { actions, useAppState } from '../store'
import { categoryById, type CategoryId } from '../categories'
import { CategoryMarker } from './CategoryMarker'
import { LegacyCategoryMarker } from './LegacyCategoryMarker'
import type { PickedPlace } from './PlaceSearch'
import { resolveDefaultViewport, type Viewport } from './mapViewport'
import { normalizePriceLevel } from '../lib/priceLevel'

type RouteEndpoint = { lat: number; lng: number; name: string }

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

type PoiPreview = {
  placeId: string
  name: string
  lat: number
  lng: number
  address?: string
  photoUrl?: string
  rating?: number
  userRatingCount?: number
  types?: string[]
  instagramUrl?: string
  phoneNumber?: string
  priceLevel?: number
  openingHours?: string[]
  googleMapsUri?: string
  businessStatus?: string
}

/** Google's "website" field is sometimes literally an Instagram link (common for small
 * businesses without a real site) — only use it when it actually is one, so we never
 * mislabel a real website as Instagram. */
function instagramUrlFromWebsite(websiteUri?: string | null): string | undefined {
  if (!websiteUri) return undefined
  return /instagram\.com|instagr\.am/i.test(websiteUri) ? websiteUri : undefined
}

type Props = {
  onAddPoi: (picked: PickedPlace) => void
  /** When true, suppresses the "No collection selected" overlay — used by the
   * full-screen Add-spot flow, where you aren't required to have one active. */
  standalone?: boolean
  /** Overrides the usual "last viewport / active collection / Lisbon" default —
   * used by the Add-spot flow to open centered on your current location. */
  initialViewport?: Viewport | null
  /** Suppresses the small tap InfoWindow bubble — used when a caller shows its
   * own richer card for the selected pin instead (e.g. the collection map view's
   * bottom-sheet overlay). */
  hideSelectionInfoWindow?: boolean
  /** When set (non-empty), only places whose category is in this list are shown —
   * a view-local filter, independent of the global hiddenCategories toggle. */
  categoryFilter?: string[]
}

export function MapView({ onAddPoi, standalone, initialViewport, hideSelectionInfoWindow, categoryFilter }: Props) {
  const activeCollection = useAppState((s) =>
    s.collections.find((c) => c.id === s.activeCollectionId) ?? null,
  )
  const places = useAppState((s) => s.places)
  const customCategories = useAppState((s) => s.customCategories)
  const hidden = useAppState((s) => s.hiddenCategories)
  const selectedId = useAppState((s) => s.selectedPlaceId)
  const focusMode = useAppState((s) => s.focusMode)
  const compareSelection = useAppState((s) => s.compareSelection)
  const userLocation = useAppState((s) => s.userLocation)
  const directionsFromMeTo = useAppState((s) => s.directionsFromMeTo)

  const activeRoute = useMemo<{ from: RouteEndpoint; to: RouteEndpoint } | null>(() => {
    if (compareSelection?.length === 2) {
      const a = places.find((p) => p.id === compareSelection[0])
      const b = places.find((p) => p.id === compareSelection[1])
      if (!a || !b) return null
      return {
        from: { lat: a.lat, lng: a.lng, name: a.name },
        to: { lat: b.lat, lng: b.lng, name: b.name },
      }
    }
    if (directionsFromMeTo && userLocation) {
      const p = places.find((pl) => pl.id === directionsFromMeTo)
      if (!p) return null
      return {
        from: { lat: userLocation.lat, lng: userLocation.lng, name: 'My location' },
        to: { lat: p.lat, lng: p.lng, name: p.name },
      }
    }
    return null
  }, [compareSelection, directionsFromMeTo, userLocation, places])

  const walkingRoute = useWalkingRoute(activeRoute?.from ?? null, activeRoute?.to ?? null)

  const visiblePlaces = useMemo(() => {
    if (!activeCollection) return []
    return places.filter(
      (p) =>
        p.collectionId === activeCollection.id &&
        !hidden.includes(p.category as CategoryId) &&
        (!categoryFilter || categoryFilter.length === 0 || categoryFilter.includes(p.category)),
    )
  }, [places, hidden, activeCollection, categoryFilter])

  // Toggling focus mode remounts the map (mapId is immutable on a live instance),
  // which would otherwise snap back to the collection's stored center/zoom and
  // discard whatever pan/zoom the user was actually looking at. Track the live
  // viewport continuously so a remount can restore it instead.
  const lastViewportRef = useRef<Viewport | null>(null)

  const { center: defaultCenter, zoom: defaultZoom } = resolveDefaultViewport(
    lastViewportRef.current ?? initialViewport ?? null,
    activeCollection,
    { center: { lat: 38.7223, lng: -9.1393 }, zoom: 13 },
  )

  const [poiPreview, setPoiPreview] = useState<PoiPreview | null>(null)
  const [poiLoading, setPoiLoading] = useState(false)
  const placesLib = useMapsLibrary('places')

  const fetchPoi = useCallback(
    async (placeId: string) => {
      if (!placesLib) return
      setPoiLoading(true)
      try {
        const place = new placesLib.Place({ id: placeId })
        await place.fetchFields({
          fields: [
            'displayName',
            'location',
            'formattedAddress',
            'photos',
            'rating',
            'userRatingCount',
            'types',
            'websiteURI',
            'nationalPhoneNumber',
            'priceLevel',
            'regularOpeningHours',
            'googleMapsURI',
            'businessStatus',
          ],
        })
        const loc = place.location
        if (!loc) return
        const photoUrl =
          place.photos?.[0]?.getURI({ maxWidth: 320, maxHeight: 180 }) ?? undefined
        setPoiPreview({
          placeId,
          name: place.displayName ?? 'Unnamed place',
          lat: loc.lat(),
          lng: loc.lng(),
          address: place.formattedAddress ?? undefined,
          photoUrl,
          rating: place.rating ?? undefined,
          userRatingCount: place.userRatingCount ?? undefined,
          types: place.types ?? undefined,
          instagramUrl: instagramUrlFromWebsite(place.websiteURI),
          phoneNumber: place.nationalPhoneNumber ?? undefined,
          priceLevel: normalizePriceLevel(place.priceLevel),
          openingHours: place.regularOpeningHours?.weekdayDescriptions ?? undefined,
          googleMapsUri: place.googleMapsURI ?? undefined,
          businessStatus: place.businessStatus ?? undefined,
        })
      } catch (err) {
        console.error('Failed to fetch POI details', err)
      } finally {
        setPoiLoading(false)
      }
    },
    [placesLib],
  )

  const handleMapClick = (event: MapMouseEvent) => {
    if (event.detail.placeId) {
      // User clicked a Google POI label — show our own preview instead of Google's default bubble.
      event.stop()
      actions.selectPlace(null)
      fetchPoi(event.detail.placeId)
    } else {
      // Empty-map click — dismiss any open popups.
      setPoiPreview(null)
      actions.selectPlace(null)
    }
  }

  return (
    <div className="relative h-full w-full">
      <Map
        // In focus mode, dropping the mapId switches Google to a raster map so the
        // `styles` array is honored (vector maps with a mapId ignore runtime styles).
        // Pins still render — AdvancedMarker falls back gracefully on raster maps.
        mapId={focusMode ? undefined : MAP_ID}
        styles={focusMode ? HIDE_POI_STYLES : undefined}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        gestureHandling="greedy"
        clickableIcons={!focusMode}
        onClick={handleMapClick}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        zoomControl
      >
        {visiblePlaces.map((place) => {
          const onClick = () => {
            setPoiPreview(null)
            if (compareSelection !== null) {
              actions.toggleCompareSelection(place.id)
            } else {
              actions.selectPlace(place.id)
            }
          }
          // AdvancedMarker needs a vector map (mapId); in focus mode we drop the
          // mapId so styles work, so swap to a legacy <Marker> with an SVG icon.
          return focusMode ? (
            <LegacyCategoryMarker
              key={place.id}
              place={place}
              selected={place.id === selectedId}
              onClick={onClick}
              customCategories={customCategories}
            />
          ) : (
            <CategoryMarker
              key={place.id}
              place={place}
              selected={place.id === selectedId}
              onClick={onClick}
              customCategories={customCategories}
            />
          )
        })}
        {!hideSelectionInfoWindow && <SelectedPlaceInfoWindow />}
        {poiPreview && (
          <PoiPreviewWindow
            poi={poiPreview}
            loading={poiLoading}
            activeCollectionName={activeCollection?.name ?? null}
            onClose={() => setPoiPreview(null)}
            onAdd={() => {
              onAddPoi({
                name: poiPreview.name,
                lat: poiPreview.lat,
                lng: poiPreview.lng,
                address: poiPreview.address,
                placeId: poiPreview.placeId,
                photoUrl: poiPreview.photoUrl,
                instagramUrl: poiPreview.instagramUrl,
                phoneNumber: poiPreview.phoneNumber,
                priceLevel: poiPreview.priceLevel,
                openingHours: poiPreview.openingHours,
                googleMapsUri: poiPreview.googleMapsUri,
                businessStatus: poiPreview.businessStatus,
                preferredCategory: guessCategoryFromTypes(poiPreview.types),
              })
              setPoiPreview(null)
            }}
          />
        )}
        <TrackViewport viewportRef={lastViewportRef} />
        <FlyToActiveCollection />
        <FlyToSelectedPlace />
        {userLocation && <UserLocationMarker location={userLocation} focusMode={focusMode} />}
        {activeRoute && walkingRoute.path && (
          <>
            <Polyline
              path={walkingRoute.path}
              strokeColor="#a13920"
              strokeWeight={5}
              strokeOpacity={0.85}
            />
            <FitBoundsToRoute
              path={walkingRoute.path}
              from={activeRoute.from}
              to={activeRoute.to}
            />
          </>
        )}
      </Map>
      {!activeCollection && !standalone && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-sm">
          <div className="pointer-events-auto rounded-2xl bg-surface-container-lowest px-6 py-5 text-center shadow-float">
            <p className="text-sm font-medium text-on-surface">No collection selected</p>
            <p className="mt-1 text-xs text-on-surface-variant">Open a collection to see it on the map.</p>
          </div>
        </div>
      )}
      {activeRoute && (
        <WalkingRoutePanel
          from={activeRoute.from}
          to={activeRoute.to}
          loading={walkingRoute.loading}
          error={walkingRoute.error}
          distanceText={walkingRoute.distanceText}
          durationText={walkingRoute.durationText}
        />
      )}
      <FocusModeToggle focusMode={focusMode} />
      <LocationControl />
    </div>
  )
}

type WalkingRouteResult = {
  path: google.maps.LatLngLiteral[] | null
  distanceText: string | null
  durationText: string | null
  loading: boolean
  error: string | null
}

function useWalkingRoute(from: RouteEndpoint | null, to: RouteEndpoint | null): WalkingRouteResult {
  const [path, setPath] = useState<google.maps.LatLngLiteral[] | null>(null)
  const [distanceText, setDistanceText] = useState<string | null>(null)
  const [durationText, setDurationText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!from || !to) {
      setPath(null)
      setDistanceText(null)
      setDurationText(null)
      setError(null)
      return
    }
    if (!window.google?.maps?.DirectionsService) return
    let cancelled = false
    setLoading(true)
    setError(null)
    const service = new google.maps.DirectionsService()
    service
      .route({
        origin: { lat: from.lat, lng: from.lng },
        destination: { lat: to.lat, lng: to.lng },
        travelMode: google.maps.TravelMode.WALKING,
      })
      .then((res) => {
        if (cancelled) return
        const route = res.routes[0]
        const leg = route?.legs[0]
        if (!route || !leg) {
          setError('No walking route found.')
          return
        }
        setPath(route.overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() })))
        setDistanceText(leg.distance?.text ?? null)
        setDurationText(leg.duration?.text ?? null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Directions request failed', err)
        setError('Couldn’t fetch walking directions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [from?.lat, from?.lng, to?.lat, to?.lng])

  return { path, distanceText, durationText, loading, error }
}

function FitBoundsToRoute({
  path,
  from,
  to,
}: {
  path: google.maps.LatLngLiteral[]
  from: RouteEndpoint
  to: RouteEndpoint
}) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const bounds = new google.maps.LatLngBounds()
    path.forEach((p) => bounds.extend(p))
    bounds.extend({ lat: from.lat, lng: from.lng })
    bounds.extend({ lat: to.lat, lng: to.lng })
    map.fitBounds(bounds, 60)
  }, [map, path, from.lat, from.lng, to.lat, to.lng])
  return null
}

function WalkingRoutePanel({
  from,
  to,
  loading,
  error,
  distanceText,
  durationText,
}: {
  from: RouteEndpoint
  to: RouteEndpoint
  loading: boolean
  error: string | null
  distanceText: string | null
  durationText: string | null
}) {
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${from.lat},${from.lng}` +
    `&destination=${to.lat},${to.lng}` +
    `&travelmode=walking`
  // Render outside the Map's DOM so it's a real overlay over the map area.
  // (Polyline above lives inside the Map; this panel sits in the same MapView
  // wrapper as the focus-mode toggle.)
  return (
    <div className="pointer-events-none absolute bottom-36 left-1/2 z-10 w-[min(420px,calc(100%-2rem))] -translate-x-1/2">
      <div className="pointer-events-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-float">
        <div className="flex items-start justify-between gap-2 border-b border-outline-variant px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Footprints className="h-3.5 w-3.5" />
            Walking route
          </div>
          <button
            onClick={() => {
              actions.exitCompareMode()
              actions.setDirectionsFromMeTo(null)
            }}
            aria-label="Close"
            className="-mr-1 -mt-0.5 rounded p-1 text-outline hover:bg-surface-container hover:text-on-surface"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="text-xs text-outline">From</div>
          <div className="truncate text-sm font-medium text-on-surface">{from.name}</div>
          <div className="mt-2 text-xs text-outline">To</div>
          <div className="truncate text-sm font-medium text-on-surface">{to.name}</div>
          <div className="mt-3 flex items-center gap-4 border-t border-outline-variant pt-3">
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-outline">
                <Loader2 className="h-3 w-3 animate-spin" />
                Calculating…
              </div>
            )}
            {error && <div className="text-xs text-error">{error}</div>}
            {!loading && !error && durationText && (
              <>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-outline">Time</div>
                  <div className="text-base font-semibold text-on-surface">{durationText}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-outline">Distance</div>
                  <div className="text-base font-semibold text-on-surface">{distanceText}</div>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:bg-primary-container"
                >
                  Open in Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const HIDE_POI_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

function FocusModeToggle({ focusMode }: { focusMode: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10">
      <button
        onClick={() => actions.toggleFocusMode()}
        title={focusMode ? 'Show Google Places' : 'Hide all Google Places, only show my list'}
        className={
          'pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium shadow-sm transition-colors ' +
          (focusMode
            ? 'border-primary bg-primary text-on-primary hover:bg-primary-container'
            : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container')
        }
      >
        {focusMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {focusMode ? 'Focus mode' : 'All places'}
      </button>
    </div>
  )
}

function SelectedPlaceInfoWindow() {
  const place = useAppState((s) =>
    s.places.find((p) => p.id === s.selectedPlaceId) ?? null,
  )
  const userLocation = useAppState((s) => s.userLocation)
  const locationStatus = useAppState((s) => s.locationStatus)
  const customCategories = useAppState((s) => s.customCategories)
  if (!place) return null
  const category = categoryById(place.category, customCategories)
  return (
    <InfoWindow
      position={{ lat: place.lat, lng: place.lng }}
      pixelOffset={[0, -36]}
      onCloseClick={() => actions.selectPlace(null)}
      headerDisabled
    >
      <div className="min-w-[220px] max-w-[260px] p-1 font-sans">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.label}
            </div>
            <h3 className="mt-1.5 text-sm font-semibold text-on-surface">{place.name}</h3>
            {place.address && (
              <p className="mt-0.5 text-xs text-on-surface-variant">{place.address}</p>
            )}
          </div>
          <button
            onClick={() => actions.selectPlace(null)}
            className="rounded-md p-1 text-outline hover:bg-surface-container hover:text-on-surface"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {place.notes && (
          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{place.notes}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (userLocation) {
                actions.setDirectionsFromMeTo(place.id)
              } else {
                // No fix yet — kick off location tracking. As soon as the
                // first position arrives, the directions will draw.
                actions.enableLocationWatch()
                actions.setDirectionsFromMeTo(place.id)
              }
            }}
            disabled={locationStatus === 'denied' || locationStatus === 'unavailable'}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2 py-1 text-xs font-medium text-on-primary hover:bg-primary-container disabled:cursor-not-allowed disabled:bg-surface-container-high"
            title={
              locationStatus === 'denied'
                ? 'Location permission denied — re-allow in browser settings.'
                : undefined
            }
          >
            <Navigation className="h-3 w-3" />
            Walk from here
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove "${place.name}" from this list?`)) {
                actions.deletePlace(place.id)
              }
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-on-surface-variant hover:bg-error-container/40 hover:text-error"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        </div>
      </div>
    </InfoWindow>
  )
}

function LocationControl() {
  const status = useAppState((s) => s.locationStatus)
  const watching = useAppState((s) => s.locationWatching)
  const location = useAppState((s) => s.userLocation)
  const map = useMap()

  // First time a fix arrives, pan to it.
  const lastPannedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!map || !location) return
    const key = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`
    if (lastPannedRef.current === key) return
    lastPannedRef.current = key
    map.panTo({ lat: location.lat, lng: location.lng })
    if ((map.getZoom() ?? 0) < 15) map.setZoom(15)
  }, [map, location])

  const handleClick = () => {
    if (!watching) {
      actions.enableLocationWatch()
      return
    }
    if (location && map) {
      // Already watching — re-center on current fix.
      map.panTo({ lat: location.lat, lng: location.lng })
      if ((map.getZoom() ?? 0) < 15) map.setZoom(15)
    }
  }

  const denied = status === 'denied' || status === 'unavailable'
  const active = watching && !denied
  const Icon = denied ? LocateOff : active ? LocateFixed : Locate

  return (
    <div className="pointer-events-none absolute bottom-20 right-4 z-10">
      <button
        type="button"
        onClick={handleClick}
        disabled={denied}
        title={
          denied
            ? status === 'denied'
              ? 'Location permission denied — re-allow in browser settings.'
              : 'Geolocation unavailable on this device.'
            : active
              ? 'Re-center on my location'
              : 'Show my location'
        }
        aria-label="Show my location"
        className={
          'pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition-colors ' +
          (denied
            ? 'cursor-not-allowed border-outline-variant bg-surface-container-lowest text-outline'
            : active
              ? 'border-transparent bg-primary text-on-primary hover:bg-primary-container'
              : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container')
        }
      >
        {status === 'requesting' && !location ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

function UserLocationMarker({
  location,
  focusMode,
}: {
  location: { lat: number; lng: number; accuracy: number }
  focusMode: boolean
}) {
  // Same trick as CategoryMarker: AdvancedMarker on vector maps, legacy Marker
  // on the raster (focus-mode) map.
  const position = { lat: location.lat, lng: location.lng }
  if (focusMode) {
    return (
      <Marker
        position={position}
        icon={legacyUserLocationIcon()}
        zIndex={2000}
        clickable={false}
      />
    )
  }
  return (
    <AdvancedMarker position={position} zIndex={2000}>
      <div className="relative">
        <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-primary/40" />
        <span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow-md" />
      </div>
    </AdvancedMarker>
  )
}

function legacyUserLocationIcon(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#a13920',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2.5,
  }
}

function PoiPreviewWindow({
  poi,
  loading,
  activeCollectionName,
  onClose,
  onAdd,
}: {
  poi: PoiPreview
  loading: boolean
  activeCollectionName: string | null
  onClose: () => void
  onAdd: () => void
}) {
  return (
    <InfoWindow
      position={{ lat: poi.lat, lng: poi.lng }}
      pixelOffset={[0, -8]}
      onCloseClick={onClose}
      headerDisabled
    >
      <div className="w-[280px] p-1 font-sans">
        {loading && !poi.photoUrl && (
          <div className="flex h-10 items-center justify-center text-xs text-outline">
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            Loading details…
          </div>
        )}
        {poi.photoUrl && (
          <div className="-mx-1 -mt-1 mb-2 aspect-[16/9] overflow-hidden rounded-t-md bg-surface-container-high">
            <img src={poi.photoUrl} alt={poi.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug text-on-surface">{poi.name}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-0.5 text-outline hover:bg-surface-container hover:text-on-surface"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {poi.rating !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            <span className="font-medium">{poi.rating.toFixed(1)}</span>
            {poi.userRatingCount !== undefined && (
              <span className="text-outline">({poi.userRatingCount.toLocaleString()})</span>
            )}
          </div>
        )}
        {poi.address && (
          <p className="mt-1.5 text-xs leading-tight text-on-surface-variant">{poi.address}</p>
        )}
        <button
          onClick={onAdd}
          disabled={!activeCollectionName}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          {activeCollectionName ? `Add to ${activeCollectionName}` : 'No collection selected'}
        </button>
      </div>
    </InfoWindow>
  )
}

/** When the active list changes, fly the map to its default center/zoom (or to fit its places). */
/** Continuously records the map's live center/zoom so a focus-mode-triggered
 * remount can restore it instead of snapping back to a stale default. */
function TrackViewport({
  viewportRef,
}: {
  viewportRef: RefObject<Viewport | null>
}) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const listener = map.addListener('idle', () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      if (!center || zoom == null) return
      viewportRef.current = { center: { lat: center.lat(), lng: center.lng() }, zoom }
    })
    return () => listener.remove()
  }, [map, viewportRef])
  return null
}

function FlyToActiveCollection() {
  const map = useMap()
  const activeCollection = useAppState((s) =>
    s.collections.find((c) => c.id === s.activeCollectionId) ?? null,
  )
  const places = useAppState((s) => s.places)
  // Toggling focus mode remounts the underlying map (mapId can't change on a live
  // instance), which changes `map`'s identity without activeCollection.id actually
  // changing — skip re-flying in that case so the user's current pan/zoom sticks.
  const lastFlownCollectionIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!map || !activeCollection) return
    if (lastFlownCollectionIdRef.current === activeCollection.id) return
    lastFlownCollectionIdRef.current = activeCollection.id
    const collectionPlaces = places.filter((p) => p.collectionId === activeCollection.id)
    if (collectionPlaces.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      collectionPlaces.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
      map.fitBounds(bounds, 80)
      return
    }
    if (collectionPlaces.length === 1) {
      map.panTo({ lat: collectionPlaces[0].lat, lng: collectionPlaces[0].lng })
      map.setZoom(15)
      return
    }
    if (activeCollection.center) {
      map.panTo(activeCollection.center)
      map.setZoom(activeCollection.zoom ?? 13)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, activeCollection?.id])
  return null
}

/** Smoothly pan to the selected place. */
function FlyToSelectedPlace() {
  const map = useMap()
  const place = useAppState((s) =>
    s.places.find((p) => p.id === s.selectedPlaceId) ?? null,
  )
  useEffect(() => {
    if (!map || !place) return
    map.panTo({ lat: place.lat, lng: place.lng })
    if ((map.getZoom() ?? 13) < 14) map.setZoom(15)
  }, [map, place?.id])
  return null
}

/** Map Google Place types to our categories so the right chip is preselected when adding. */
function guessCategoryFromTypes(types?: string[]): CategoryId {
  if (!types?.length) return 'other'
  const set = new Set(types)
  const hasAny = (arr: string[]) => arr.some((t) => set.has(t))
  if (
    hasAny([
      'restaurant', 'food', 'cafe', 'bakery', 'meal_takeaway', 'meal_delivery',
      'ice_cream_shop', 'sandwich_shop', 'breakfast_restaurant',
    ])
  ) return 'eating'
  if (hasAny(['bar', 'night_club', 'liquor_store', 'pub', 'wine_bar'])) return 'bars'
  if (
    hasAny([
      'tourist_attraction', 'museum', 'art_gallery', 'church', 'monastery',
      'hindu_temple', 'mosque', 'synagogue', 'park', 'landmark', 'historical_landmark',
      'place_of_worship',
    ])
  ) return 'sightseeing'
  if (
    hasAny([
      'shopping_mall', 'store', 'clothing_store', 'jewelry_store', 'book_store',
      'electronics_store', 'department_store', 'supermarket', 'market',
    ])
  ) return 'shopping'
  if (
    hasAny([
      'amusement_park', 'aquarium', 'zoo', 'gym', 'spa', 'movie_theater',
      'stadium', 'bowling_alley', 'casino',
    ])
  ) return 'activities'
  return 'other'
}
