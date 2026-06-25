import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { CATEGORY_BY_ID, type CategoryId } from '../categories'
import { CategoryMarker } from './CategoryMarker'
import { LegacyCategoryMarker } from './LegacyCategoryMarker'
import type { PickedPlace } from './PlaceSearch'

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
}

type Props = {
  onAddPoi: (picked: PickedPlace) => void
}

export function MapView({ onAddPoi }: Props) {
  const activeList = useAppState((s) =>
    s.lists.find((l) => l.id === s.activeListId) ?? null,
  )
  const places = useAppState((s) => s.places)
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
    if (!activeList) return []
    return places.filter(
      (p) => p.listId === activeList.id && !hidden.includes(p.category),
    )
  }, [places, hidden, activeList])

  const defaultCenter = activeList?.center ?? { lat: 38.7223, lng: -9.1393 }
  const defaultZoom = activeList?.zoom ?? 13

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
            />
          ) : (
            <CategoryMarker
              key={place.id}
              place={place}
              selected={place.id === selectedId}
              onClick={onClick}
            />
          )
        })}
        <SelectedPlaceInfoWindow />
        {poiPreview && (
          <PoiPreviewWindow
            poi={poiPreview}
            loading={poiLoading}
            activeListName={activeList?.name ?? null}
            onClose={() => setPoiPreview(null)}
            onAdd={() => {
              onAddPoi({
                name: poiPreview.name,
                lat: poiPreview.lat,
                lng: poiPreview.lng,
                address: poiPreview.address,
                placeId: poiPreview.placeId,
                preferredCategory: guessCategoryFromTypes(poiPreview.types),
              })
              setPoiPreview(null)
            }}
          />
        )}
        <FlyToActiveList />
        <FlyToSelectedPlace />
        {userLocation && <UserLocationMarker location={userLocation} focusMode={focusMode} />}
        {activeRoute && walkingRoute.path && (
          <>
            <Polyline
              path={walkingRoute.path}
              strokeColor="#4f46e5"
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
      {!activeList && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="pointer-events-auto rounded-2xl bg-white px-6 py-5 text-center shadow-lg ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-900">No list selected</p>
            <p className="mt-1 text-xs text-zinc-500">Create a list from the sidebar to start saving places.</p>
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
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-[min(420px,calc(100%-2rem))] -translate-x-1/2">
      <div className="pointer-events-auto rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-2 border-b border-zinc-100 px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            <Footprints className="h-3.5 w-3.5" />
            Walking route
          </div>
          <button
            onClick={() => {
              actions.exitCompareMode()
              actions.setDirectionsFromMeTo(null)
            }}
            aria-label="Close"
            className="-mr-1 -mt-0.5 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="text-xs text-zinc-500">From</div>
          <div className="truncate text-sm font-medium text-zinc-900">{from.name}</div>
          <div className="mt-2 text-xs text-zinc-500">To</div>
          <div className="truncate text-sm font-medium text-zinc-900">{to.name}</div>
          <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3">
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Calculating…
              </div>
            )}
            {error && <div className="text-xs text-red-600">{error}</div>}
            {!loading && !error && durationText && (
              <>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400">Time</div>
                  <div className="text-base font-semibold text-zinc-900">{durationText}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400">Distance</div>
                  <div className="text-base font-semibold text-zinc-900">{distanceText}</div>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
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
            ? 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800'
            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50')
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
  if (!place) return null
  const category = CATEGORY_BY_ID[place.category]
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
            <h3 className="mt-1.5 text-sm font-semibold text-zinc-900">{place.name}</h3>
            {place.address && (
              <p className="mt-0.5 text-xs text-zinc-500">{place.address}</p>
            )}
          </div>
          <button
            onClick={() => actions.selectPlace(null)}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {place.notes && (
          <p className="mt-2 text-xs leading-relaxed text-zinc-700">{place.notes}</p>
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
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
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
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-red-50 hover:text-red-600"
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
            ? 'cursor-not-allowed border-zinc-200 bg-white text-zinc-300'
            : active
              ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50')
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
        <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-indigo-400/40" />
        <span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-md" />
      </div>
    </AdvancedMarker>
  )
}

function legacyUserLocationIcon(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#4f46e5',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2.5,
  }
}

function PoiPreviewWindow({
  poi,
  loading,
  activeListName,
  onClose,
  onAdd,
}: {
  poi: PoiPreview
  loading: boolean
  activeListName: string | null
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
          <div className="flex h-10 items-center justify-center text-xs text-zinc-400">
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            Loading details…
          </div>
        )}
        {poi.photoUrl && (
          <div className="-mx-1 -mt-1 mb-2 aspect-[16/9] overflow-hidden rounded-t-md bg-zinc-100">
            <img src={poi.photoUrl} alt={poi.name} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug text-zinc-900">{poi.name}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {poi.rating !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            <span className="font-medium">{poi.rating.toFixed(1)}</span>
            {poi.userRatingCount !== undefined && (
              <span className="text-zinc-400">({poi.userRatingCount.toLocaleString()})</span>
            )}
          </div>
        )}
        {poi.address && (
          <p className="mt-1.5 text-xs leading-tight text-zinc-500">{poi.address}</p>
        )}
        <button
          onClick={onAdd}
          disabled={!activeListName}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          {activeListName ? `Add to ${activeListName}` : 'No list selected'}
        </button>
      </div>
    </InfoWindow>
  )
}

/** When the active list changes, fly the map to its default center/zoom (or to fit its places). */
function FlyToActiveList() {
  const map = useMap()
  const activeList = useAppState((s) =>
    s.lists.find((l) => l.id === s.activeListId) ?? null,
  )
  const places = useAppState((s) => s.places)

  useEffect(() => {
    if (!map || !activeList) return
    const listPlaces = places.filter((p) => p.listId === activeList.id)
    if (listPlaces.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      listPlaces.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
      map.fitBounds(bounds, 80)
      return
    }
    if (listPlaces.length === 1) {
      map.panTo({ lat: listPlaces[0].lat, lng: listPlaces[0].lng })
      map.setZoom(15)
      return
    }
    if (activeList.center) {
      map.panTo(activeList.center)
      map.setZoom(activeList.zoom ?? 13)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, activeList?.id])
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
