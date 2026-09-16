import type { CategoryId } from './categories'

export type Creator = {
  id: string
  handle: string
  name: string
  avatarUrl: string
  bio?: string
  followerCount: number
  followingCount: number
}

export type Collection = {
  id: string
  name: string
  description?: string
  createdAt: number
  creatorId: string
  coverPhotoUrls?: string[]
  // Optional default map view when this collection is opened
  center?: { lat: number; lng: number }
  zoom?: number
}

export type Place = {
  id: string
  collectionId: string
  name: string
  category: CategoryId
  lat: number
  lng: number
  address?: string
  notes?: string
  photoUrl?: string
  instagramUrl?: string
  // Google Place ID (when added via Places search) — useful for re-fetching details later
  placeId?: string
  phoneNumber?: string
  /** 0 (free) – 4 (very expensive), same scale Google uses. */
  priceLevel?: number
  /** Weekly hours as Google formats them, e.g. "Monday: 9:00 AM – 5:00 PM". */
  openingHours?: string[]
  googleMapsUri?: string
  businessStatus?: string
  createdAt: number
}
