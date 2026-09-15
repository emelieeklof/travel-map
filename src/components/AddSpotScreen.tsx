import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { MapView } from './MapView'
import { PlaceSearch, type PickedPlace } from './PlaceSearch'
import { AddPlaceDialog } from './AddPlaceDialog'
import { actions } from '../store'
import type { Viewport } from './mapViewport'

export function AddSpotScreen({ onClose }: { onClose: () => void }) {
  const [picked, setPicked] = useState<PickedPlace | null>(null)
  const [locating, setLocating] = useState(true)
  const [initialViewport, setInitialViewport] = useState<Viewport | null>(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInitialViewport({
          center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          zoom: 15,
        })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  }, [])

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
        {locating ? (
          <div className="flex h-full w-full items-center justify-center bg-surface-container">
            <Loader2 className="h-5 w-5 animate-spin text-outline" />
          </div>
        ) : (
          <MapView onAddPoi={setPicked} standalone initialViewport={initialViewport} />
        )}
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
