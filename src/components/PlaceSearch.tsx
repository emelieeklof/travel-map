import { useEffect, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { Search, Loader2 } from 'lucide-react'
import { AUTOCOMPLETE_FIELDS, placeResultToPicked, type PickedPlace } from '../lib/placeAutocomplete'

export type { PickedPlace }

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
      fields: AUTOCOMPLETE_FIELDS,
    })
    const listener = autocomplete.addListener('place_changed', () => {
      const picked = placeResultToPicked(autocomplete.getPlace())
      if (!picked) return
      onPick(picked)
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
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
      ) : (
        <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-outline" />
      )}
      <input
        ref={inputRef}
        type="text"
        disabled={disabled || !ready}
        placeholder={
          disabled
            ? 'Create a collection first to add pins'
            : ready
              ? 'Search for a restaurant, museum, bar…'
              : 'Loading search…'
        }
        className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-2.5 pl-9 pr-4 text-sm shadow-card outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline"
      />
    </div>
  )
}
