import { useEffect } from 'react'
import { ChevronLeft, Footprints, X as XIcon } from 'lucide-react'
import { MapView } from './MapView'
import { actions, useAppState } from '../store'

export function CollectionMapView({ collectionId }: { collectionId: string }) {
  const collection = useAppState((s) => s.collections.find((c) => c.id === collectionId) ?? null)
  const places = useAppState((s) => s.places)
  const compareSelection = useAppState((s) => s.compareSelection)

  useEffect(() => {
    actions.setActiveCollection(collectionId)
  }, [collectionId])

  const pinCount = places.filter((p) => p.collectionId === collectionId).length
  const compareAvailable = pinCount >= 2

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-3 pt-3">
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
          <div className="truncate text-sm font-semibold text-on-surface">{collection?.name ?? 'Collection'}</div>
        </div>
        {compareAvailable && (
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
      <div className="flex-1">
        <MapView
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
            })
          }
        />
      </div>
    </div>
  )
}
