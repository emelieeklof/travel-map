import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Footprints, Map as MapIcon, List as ListIcon, X as XIcon } from 'lucide-react'
import { MapView } from './MapView'
import { SpotDetailContent } from './SpotDetailContent'
import { PinTile } from './PinTile'
import { allCategoriesSorted, type Category } from '../categories'
import { actions, useAppState } from '../store'
import type { CustomCategory, Place } from '../types'

export function CityView({ collectionId }: { collectionId: string }) {
  const collection = useAppState((s) => s.collections.find((c) => c.id === collectionId) ?? null)
  const allPlaces = useAppState((s) => s.places)
  const customCategories = useAppState((s) => s.customCategories)
  const selectedId = useAppState((s) => s.selectedPlaceId)
  const compareSelection = useAppState((s) => s.compareSelection)

  const [tab, setTab] = useState<'map' | 'list'>('map')
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  useEffect(() => {
    actions.setActiveCollection(collectionId)
  }, [collectionId])

  const collectionPlaces = allPlaces.filter((p) => p.collectionId === collectionId)
  const compareAvailable = collectionPlaces.length >= 2

  const presentCategories = useMemo(() => {
    const ids = new Set(collectionPlaces.map((p) => p.category))
    return allCategoriesSorted(customCategories).filter((c) => ids.has(c.id))
  }, [collectionPlaces, customCategories])

  const filteredPlaces = useMemo(
    () => (activeFilters.size === 0 ? collectionPlaces : collectionPlaces.filter((p) => activeFilters.has(p.category))),
    [collectionPlaces, activeFilters],
  )

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedPlace = collectionPlaces.find((p) => p.id === selectedId) ?? null

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2 px-3 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              actions.exitCompareMode()
              actions.closeDetail()
            }}
            aria-label="Back"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card"
          >
            <ChevronLeft className="h-5 w-5 text-on-surface-variant" />
          </button>
          <div className="flex-1 truncate rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-card">
            <div className="truncate text-sm font-semibold text-on-surface">{collection?.name ?? 'City'}</div>
          </div>
          <div className="inline-flex shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card">
            <button
              type="button"
              onClick={() => setTab('map')}
              aria-label="Map view"
              className={
                'inline-flex h-10 w-10 items-center justify-center ' +
                (tab === 'map' ? 'bg-primary text-on-primary' : 'text-on-surface-variant')
              }
            >
              <MapIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTab('list')}
              aria-label="List view"
              className={
                'inline-flex h-10 w-10 items-center justify-center ' +
                (tab === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface-variant')
              }
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          {tab === 'map' && compareAvailable && (
            <button
              type="button"
              onClick={() => (compareSelection === null ? actions.enterCompareMode() : actions.exitCompareMode())}
              aria-label="Compare walking distance"
              title="Compare walking distance"
              className={
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-card ' +
                (compareSelection !== null
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant')
              }
            >
              {compareSelection !== null ? <XIcon className="h-4 w-4" /> : <Footprints className="h-4 w-4" />}
            </button>
          )}
        </div>

        {presentCategories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {presentCategories.map((c) => {
              const Icon = c.icon
              const active = activeFilters.has(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleFilter(c.id)}
                  className={
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-card transition-all ' +
                    (active
                      ? 'border-transparent text-white'
                      : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant')
                  }
                  style={active ? { backgroundColor: c.color } : undefined}
                >
                  <Icon className="h-3 w-3" strokeWidth={2.5} />
                  {c.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        {tab === 'map' ? (
          <>
            <MapView
              hideSelectionInfoWindow
              categoryFilter={activeFilters.size > 0 ? [...activeFilters] : undefined}
              onAddPoi={(picked) =>
                actions.addPlace({
                  collectionId,
                  name: picked.name,
                  category: picked.preferredCategory ?? 'other',
                  lat: picked.lat,
                  lng: picked.lng,
                  address: picked.address,
                  placeId: picked.placeId,
                  photoUrl: picked.photoUrl,
                  instagramUrl: picked.instagramUrl,
                  phoneNumber: picked.phoneNumber,
                  priceLevel: picked.priceLevel,
                  openingHours: picked.openingHours,
                  googleMapsUri: picked.googleMapsUri,
                  businessStatus: picked.businessStatus,
                })
              }
            />

            {selectedPlace && (
              <div className="absolute left-4 right-16 bottom-28 z-10 max-h-[45%] overflow-y-auto rounded-3xl bg-surface shadow-float">
                <button
                  onClick={() => actions.selectPlace(null)}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-surface/90 flex items-center justify-center shadow-card"
                >
                  <XIcon size={15} />
                </button>
                <SpotDetailContent placeId={selectedPlace.id} />
              </div>
            )}
          </>
        ) : (
          <CityListTab places={filteredPlaces} customCategories={customCategories} />
        )}
      </div>
    </div>
  )
}

function CityListTab({
  places,
  customCategories,
}: {
  places: Place[]
  customCategories: CustomCategory[]
}) {
  const allCategories: Category[] = allCategoriesSorted(customCategories)

  return (
    <div className="h-full overflow-y-auto px-3 pt-28 pb-6">
      {allCategories.map((cat) => {
        const items = places.filter((p) => p.category === cat.id)
        if (items.length === 0) return null
        return (
          <div key={cat.id} className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <cat.icon size={14} color={cat.color} strokeWidth={2.5} />
              <span className="text-xs font-semibold text-on-surface">{cat.label}</span>
              <span className="text-xs text-on-surface-variant">· {items.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((p) => (
                <PinTile key={p.id} place={p} />
              ))}
            </div>
          </div>
        )
      })}
      {places.length === 0 && (
        <div className="pt-12 text-center text-sm text-on-surface-variant">No pins match this filter.</div>
      )}
    </div>
  )
}
