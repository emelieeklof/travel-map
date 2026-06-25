import { useEffect, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { Search, Loader2 } from 'lucide-react'
import type { CategoryId } from '../categories'

export type PickedPlace = {
  name: string
  lat: number
  lng: number
  address?: string
  placeId?: string
  /** If provided, AddPlaceDialog will preselect this category instead of guessing from the name. */
  preferredCategory?: CategoryId
}

type Props = {
  onPick: (place: PickedPlace) => void
  disabled?: boolean
}

export function PlaceSearch({ onPick, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const placesLib = useMapsLibrary('places')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!placesLib || !inputRef.current) return
    // Note: google.maps.places.Autocomplete is soft-deprecated (March 2025) in
    // favor of the PlaceAutocompleteElement web component. It still works for
    // existing projects but may be unavailable on brand-new GCP projects.
    // If you hit that wall, swap this for PlaceAutocompleteElement — see
    // README "Roadmap" section.
    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ['name', 'geometry.location', 'formatted_address', 'place_id'],
    })
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      const loc = place.geometry?.location
      if (!loc) return
      onPick({
        name: place.name ?? 'Unnamed place',
        lat: loc.lat(),
        lng: loc.lng(),
        address: place.formatted_address,
        placeId: place.place_id,
      })
      if (inputRef.current) inputRef.current.value = ''
    })
    setReady(true)
    return () => {
      listener.remove()
    }
  }, [placesLib, onPick])

  return (
    <div className="relative">
      {ready ? (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      ) : (
        <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
      )}
      <input
        ref={inputRef}
        type="text"
        disabled={disabled || !ready}
        placeholder={
          disabled
            ? 'Create a list first to add places'
            : ready
              ? 'Search for a restaurant, museum, bar…'
              : 'Loading search…'
        }
        className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
      />
    </div>
  )
}
