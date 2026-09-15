import { useState } from 'react'
import { X } from 'lucide-react'
import { MapView } from './MapView'
import { PlaceSearch, type PickedPlace } from './PlaceSearch'
import { AddPlaceDialog } from './AddPlaceDialog'
import { actions } from '../store'

export function AddSpotScreen({ onClose }: { onClose: () => void }) {
  const [picked, setPicked] = useState<PickedPlace | null>(null)

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 flex items-start gap-2 px-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card"
        >
          <X className="h-5 w-5 text-on-surface-variant" />
        </button>
        <div className="w-full">
          <PlaceSearch onPick={setPicked} />
        </div>
      </div>
      <div className="flex-1">
        <MapView onAddPoi={setPicked} standalone />
      </div>
      <AddPlaceDialog
        picked={picked}
        onCancel={() => setPicked(null)}
        onSave={(input) => {
          actions.addPlace({
            collectionId: input.collectionId,
            name: input.name,
            category: input.category,
            lat: input.lat,
            lng: input.lng,
            address: input.address,
            placeId: input.placeId,
            photoUrl: input.photoUrl,
            instagramUrl: input.instagramUrl,
            notes: input.notes,
          })
          setPicked(null)
          onClose()
        }}
      />
    </div>
  )
}
