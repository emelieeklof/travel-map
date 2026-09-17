import type { CategoryId } from '../categories'
import { normalizePriceLevel } from './priceLevel'

export type PickedPlace = {
  name: string
  lat: number
  lng: number
  address?: string
  placeId?: string
  photoUrl?: string
  instagramUrl?: string
  phoneNumber?: string
  priceLevel?: number
  openingHours?: string[]
  googleMapsUri?: string
  businessStatus?: string
  /** If provided, AddPlaceDialog will preselect this category instead of guessing from the name. */
  preferredCategory?: CategoryId
}

/** Fields fetched for a picked Autocomplete result — shared by every place-search input. */
export const AUTOCOMPLETE_FIELDS = [
  'name',
  'geometry.location',
  'formatted_address',
  'place_id',
  'website',
  'photos',
  'formatted_phone_number',
  'price_level',
  'opening_hours',
  'url',
  'business_status',
]

/** Google's "website" field is sometimes literally an Instagram link (common for small
 * businesses without a real site) — only use it when it actually is one, so we never
 * mislabel a real website as Instagram. */
function instagramUrlFromWebsite(website?: string | null): string | undefined {
  if (!website) return undefined
  return /instagram\.com|instagr\.am/i.test(website) ? website : undefined
}

/** Converts a raw Autocomplete result into our PickedPlace shape, or null if it has no location. */
export function placeResultToPicked(place: google.maps.places.PlaceResult): PickedPlace | null {
  const loc = place.geometry?.location
  if (!loc) return null
  return {
    name: place.name ?? 'Unnamed place',
    lat: loc.lat(),
    lng: loc.lng(),
    address: place.formatted_address,
    placeId: place.place_id,
    photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 640, maxHeight: 480 }),
    instagramUrl: instagramUrlFromWebsite(place.website),
    phoneNumber: place.formatted_phone_number,
    priceLevel: normalizePriceLevel(place.price_level),
    openingHours: place.opening_hours?.weekday_text,
    googleMapsUri: place.url,
    businessStatus: place.business_status,
  }
}
