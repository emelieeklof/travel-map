import { useSyncExternalStore } from 'react'
import type { CategoryId } from './categories'
import type { List, Place } from './types'

const STORAGE_KEY = 'travel-map:v1'

export type AppState = {
  lists: List[]
  places: Place[]
  activeListId: string | null
  /** Category IDs the user has toggled OFF (hidden from the map and list). */
  hiddenCategories: CategoryId[]
  /** Place focused in the side panel + map info popup. */
  selectedPlaceId: string | null
  /** When true, all default Google POIs are hidden — only the user's saved pins remain. */
  focusMode: boolean
  /**
   * "Compare two places" mode. `null` means the user isn't comparing right now.
   * Otherwise, an array of 0–2 place IDs they've picked so far.
   */
  compareSelection: string[] | null
  /** Current device location from the browser Geolocation API. */
  userLocation: { lat: number; lng: number; accuracy: number } | null
  locationStatus: 'idle' | 'requesting' | 'watching' | 'denied' | 'unavailable'
  /** When true, App.tsx keeps a `watchPosition` subscription active. */
  locationWatching: boolean
  /**
   * When set, the map draws a walking route from `userLocation` to the place
   * with this ID. Mutually exclusive with compareSelection in practice — the
   * UI only ever sets one at a time.
   */
  directionsFromMeTo: string | null
}

const initial: AppState = {
  lists: [],
  places: [],
  activeListId: null,
  hiddenCategories: [],
  selectedPlaceId: null,
  focusMode: false,
  compareSelection: null,
  userLocation: null,
  locationStatus: 'idle',
  locationWatching: false,
  directionsFromMeTo: null,
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...initial,
      ...parsed,
      // Transient runtime state — never restore these from disk.
      userLocation: null,
      locationStatus: 'idle',
      locationWatching: false,
      directionsFromMeTo: null,
    }
  } catch {
    return initial
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore quota errors in prototype.
  }
}

function set(updater: (s: AppState) => AppState) {
  state = updater(state)
  persist()
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

const newId = () => Math.random().toString(36).slice(2, 10)

export const actions = {
  createList(input: { name: string; description?: string; center?: { lat: number; lng: number }; zoom?: number }): string {
    const list: List = {
      id: newId(),
      name: input.name,
      description: input.description,
      center: input.center,
      zoom: input.zoom,
      createdAt: Date.now(),
    }
    set((s) => ({
      ...s,
      lists: [...s.lists, list],
      activeListId: list.id,
      selectedPlaceId: null,
    }))
    return list.id
  },

  renameList(listId: string, name: string) {
    set((s) => ({
      ...s,
      lists: s.lists.map((l) => (l.id === listId ? { ...l, name } : l)),
    }))
  },

  deleteList(listId: string) {
    set((s) => {
      const remaining = s.lists.filter((l) => l.id !== listId)
      return {
        ...s,
        lists: remaining,
        places: s.places.filter((p) => p.listId !== listId),
        activeListId:
          s.activeListId === listId ? remaining[0]?.id ?? null : s.activeListId,
        selectedPlaceId: null,
      }
    })
  },

  setActiveList(listId: string | null) {
    set((s) => ({ ...s, activeListId: listId, selectedPlaceId: null }))
  },

  addPlace(input: Omit<Place, 'id' | 'createdAt'>): string {
    const place: Place = { ...input, id: newId(), createdAt: Date.now() }
    set((s) => ({ ...s, places: [...s.places, place], selectedPlaceId: place.id }))
    return place.id
  },

  updatePlace(placeId: string, patch: Partial<Omit<Place, 'id' | 'createdAt' | 'listId'>>) {
    set((s) => ({
      ...s,
      places: s.places.map((p) => (p.id === placeId ? { ...p, ...patch } : p)),
    }))
  },

  deletePlace(placeId: string) {
    set((s) => ({
      ...s,
      places: s.places.filter((p) => p.id !== placeId),
      selectedPlaceId: s.selectedPlaceId === placeId ? null : s.selectedPlaceId,
    }))
  },

  toggleCategory(category: CategoryId) {
    set((s) => ({
      ...s,
      hiddenCategories: s.hiddenCategories.includes(category)
        ? s.hiddenCategories.filter((c) => c !== category)
        : [...s.hiddenCategories, category],
    }))
  },

  showOnlyCategory(category: CategoryId) {
    set((s) => ({
      ...s,
      hiddenCategories: (
        ['eating', 'sightseeing', 'shopping', 'bars', 'activities', 'other'] as CategoryId[]
      ).filter((c) => c !== category),
    }))
  },

  showAllCategories() {
    set((s) => ({ ...s, hiddenCategories: [] }))
  },

  selectPlace(placeId: string | null) {
    set((s) => ({ ...s, selectedPlaceId: placeId }))
  },

  toggleFocusMode() {
    set((s) => ({ ...s, focusMode: !s.focusMode }))
  },

  enterCompareMode() {
    set((s) => ({
      ...s,
      compareSelection: [],
      selectedPlaceId: null,
      directionsFromMeTo: null,
    }))
  },

  enableLocationWatch() {
    set((s) => ({
      ...s,
      locationWatching: true,
      locationStatus: s.locationStatus === 'denied' ? 'denied' : 'requesting',
    }))
  },

  disableLocationWatch() {
    set((s) => ({
      ...s,
      locationWatching: false,
      userLocation: null,
      locationStatus: 'idle',
      directionsFromMeTo: null,
    }))
  },

  setUserLocation(loc: { lat: number; lng: number; accuracy: number } | null) {
    set((s) => ({ ...s, userLocation: loc }))
  },

  setLocationStatus(status: AppState['locationStatus']) {
    set((s) => ({ ...s, locationStatus: status }))
  },

  setDirectionsFromMeTo(placeId: string | null) {
    set((s) => ({
      ...s,
      directionsFromMeTo: placeId,
      // Picking a "walk from me" destination ends compare mode.
      compareSelection: placeId ? null : s.compareSelection,
      // And dismisses any open info-window so the route is unobstructed.
      selectedPlaceId: placeId ? null : s.selectedPlaceId,
    }))
  },

  exitCompareMode() {
    set((s) => ({ ...s, compareSelection: null }))
  },

  toggleCompareSelection(placeId: string) {
    set((s) => {
      const current = s.compareSelection ?? []
      if (current.includes(placeId)) {
        return { ...s, compareSelection: current.filter((id) => id !== placeId) }
      }
      // Cap at 2. If user is picking a third, drop the oldest.
      const next = current.length >= 2 ? [current[1], placeId] : [...current, placeId]
      return { ...s, compareSelection: next }
    })
  },

  clearCompareSelection() {
    set((s) => ({ ...s, compareSelection: [] }))
  },
}

/** Seed a demo Lisbon list on first run so the empty state isn't blank. */
export function seedIfEmpty() {
  if (state.lists.length > 0) return
  const listId = newId()
  const now = Date.now()
  const lisbon: List = {
    id: listId,
    name: 'Lisbon',
    description: 'Long weekend — October 2026',
    center: { lat: 38.7223, lng: -9.1393 },
    zoom: 13,
    createdAt: now,
  }
  const samples: Omit<Place, 'id' | 'createdAt'>[] = [
    { listId, name: 'Time Out Market', category: 'eating', lat: 38.7066, lng: -9.1459, address: 'Av. 24 de Julho 49', notes: 'Bifanas at the Henrique Sá Pessoa stall.' },
    { listId, name: 'Pastéis de Belém', category: 'eating', lat: 38.6975, lng: -9.2032, address: 'R. de Belém 84-92', notes: 'Worth the queue. Warm, dusted with cinnamon.' },
    { listId, name: 'Jerónimos Monastery', category: 'sightseeing', lat: 38.6979, lng: -9.2068, notes: 'Book online to skip the line.' },
    { listId, name: 'Miradouro da Senhora do Monte', category: 'sightseeing', lat: 38.7170, lng: -9.1335, notes: 'Best sunset view in the city.' },
    { listId, name: 'LX Factory', category: 'shopping', lat: 38.7028, lng: -9.1771, notes: 'Independent boutiques, bookshops, food.' },
    { listId, name: 'Pensão Amor', category: 'bars', lat: 38.7079, lng: -9.1456, notes: 'Bordello-themed cocktail bar in Cais do Sodré.' },
    { listId, name: 'Tram 28 ride', category: 'activities', lat: 38.7110, lng: -9.1330, notes: 'Go early to get a window seat.' },
  ]
  set((s) => ({
    ...s,
    lists: [lisbon],
    activeListId: listId,
    places: samples.map((p) => ({ ...p, id: newId(), createdAt: now })),
  }))
}
