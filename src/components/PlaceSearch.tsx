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
  photoUrl?: string
  instagramUrl?: string
  /** If provided, AddPlaceDialog will preselect this category instead of guessing from the name. */
  preferredCategory?: CategoryId
}

/** Google's "website" field is sometimes literally an Instagram link (common for small
 * businesses without a real site) — only use it when it actually is one, so we never
 * mislabel a real website as Instagram. */
function instagramUrlFromWebsite(website?: string | null): string | undefined {
  if (!website) return undefined
  return /instagram\.com|instagr\.am/i.test(website) ? website : undefined
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
      fields: ['name', 'geometry.location', 'formatted_address', 'place_id', 'website', 'photos'],
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
        photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 640, maxHeight: 480 }),
        instagramUrl: instagramUrlFromWebsite(place.website),
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
