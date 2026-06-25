import type { CategoryId } from './categories'

export type List = {
  id: string
  name: string
  description?: string
  createdAt: number
  // Optional default map view when this list is opened
  center?: { lat: number; lng: number }
  zoom?: number
}

export type Place = {
  id: string
  listId: string
  name: string
  category: CategoryId
  lat: number
  lng: number
  address?: string
  notes?: string
  // Google Place ID (when added via Places search) — useful for re-fetching details later
  placeId?: string
  createdAt: number
}
