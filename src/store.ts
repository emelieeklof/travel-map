import { useSyncExternalStore } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import type { CategoryId } from './categories'
import type { Collection, Creator, Place } from './types'
import { MOCK_CREATORS, MOCK_COLLECTIONS, MOCK_PLACES, DEFAULT_FOLLOW_IDS, starterLisbonSeed } from './mockCreators'

const LEGACY_STORAGE_KEY = 'spotted:v1'

export type Tab = 'home' | 'explore' | 'guides' | 'profile'
export type Detail =
  | { type: 'collection'; id: string }
  | { type: 'spot'; id: string }
  | { type: 'creator'; id: string }

export type AppState = {
  /** 'loading' until the Supabase session check resolves; 'signedOut' shows the sign-in screen. */
  authStatus: 'loading' | 'signedOut' | 'signedIn'
  /** The signed-in user's id (also `creatorId` on every collection you own). Null until signed in. */
  userId: string | null
  creators: Creator[]
  collections: Collection[]
  places: Place[]
  followedCreatorIds: string[]
  activeCollectionId: string | null
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
  /** Bottom-nav tab + optional full-screen detail overlay (collection/spot/creator). */
  tab: Tab
  detail: Detail | null
}

const initial: AppState = {
  authStatus: 'loading',
  userId: null,
  creators: [],
  collections: [],
  places: [],
  followedCreatorIds: [],
  activeCollectionId: null,
  hiddenCategories: [],
  selectedPlaceId: null,
  focusMode: false,
  compareSelection: null,
  userLocation: null,
  locationStatus: 'idle',
  locationWatching: false,
  directionsFromMeTo: null,
  tab: 'home',
  detail: null,
}

let state: AppState = initial
const listeners = new Set<() => void>()

function set(updater: (s: AppState) => AppState) {
  state = updater(state)
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

function logWriteError(action: string, error: { message: string } | null) {
  if (error) console.error(`[supabase] ${action} failed:`, error.message)
}

// ---- row <-> app-type mapping ---------------------------------------------

type CollectionRow = {
  id: string
  owner_id: string
  name: string
  description: string | null
  center_lat: number | null
  center_lng: number | null
  zoom: number | null
  created_at: string
}

type PlaceRow = {
  id: string
  collection_id: string
  name: string
  category: string
  lat: number
  lng: number
  address: string | null
  notes: string | null
  photo_url: string | null
  instagram_url: string | null
  place_id: string | null
  phone_number: string | null
  price_level: number | null
  opening_hours: string[] | null
  google_maps_uri: string | null
  business_status: string | null
  created_at: string
}

function collectionFromRow(r: CollectionRow): Collection {
  return {
    id: r.id,
    creatorId: r.owner_id,
    name: r.name,
    description: r.description ?? undefined,
    center: r.center_lat != null && r.center_lng != null ? { lat: r.center_lat, lng: r.center_lng } : undefined,
    zoom: r.zoom ?? undefined,
    createdAt: Date.parse(r.created_at),
  }
}

function placeFromRow(r: PlaceRow): Place {
  return {
    id: r.id,
    collectionId: r.collection_id,
    name: r.name,
    category: r.category as CategoryId,
    lat: r.lat,
    lng: r.lng,
    address: r.address ?? undefined,
    notes: r.notes ?? undefined,
    photoUrl: r.photo_url ?? undefined,
    instagramUrl: r.instagram_url ?? undefined,
    placeId: r.place_id ?? undefined,
    phoneNumber: r.phone_number ?? undefined,
    priceLevel: r.price_level ?? undefined,
    openingHours: r.opening_hours ?? undefined,
    googleMapsUri: r.google_maps_uri ?? undefined,
    businessStatus: r.business_status ?? undefined,
    createdAt: Date.parse(r.created_at),
  }
}

function collectionToRow(c: Collection) {
  return {
    id: c.id,
    owner_id: c.creatorId,
    name: c.name,
    description: c.description ?? null,
    center_lat: c.center?.lat ?? null,
    center_lng: c.center?.lng ?? null,
    zoom: c.zoom ?? null,
  }
}

function placeToRow(p: Place) {
  return {
    id: p.id,
    collection_id: p.collectionId,
    name: p.name,
    category: p.category,
    lat: p.lat,
    lng: p.lng,
    address: p.address ?? null,
    notes: p.notes ?? null,
    photo_url: p.photoUrl ?? null,
    instagram_url: p.instagramUrl ?? null,
    place_id: p.placeId ?? null,
    phone_number: p.phoneNumber ?? null,
    price_level: p.priceLevel ?? null,
    opening_hours: p.openingHours ?? null,
    google_maps_uri: p.googleMapsUri ?? null,
    business_status: p.businessStatus ?? null,
  }
}

// ---- auth-driven hydration -------------------------------------------------

function deriveHandle(user: User): string {
  const emailLocal = user.email?.split('@')[0]
  return (user.user_metadata?.preferred_username as string) || emailLocal || 'you'
}

/** One-time import of any pre-auth localStorage data (from the old client-only prototype). */
function importLegacyLocalData(): { name: string; description?: string; center?: { lat: number; lng: number }; zoom?: number; places: Omit<Place, 'id' | 'collectionId' | 'createdAt'>[] } | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { collections?: Collection[]; places?: Place[] }
    const mine = parsed.collections?.find((c) => c.creatorId === 'me')
    if (!mine) return null
    const myPlaces = (parsed.places ?? []).filter((p) => p.collectionId === mine.id)
    return {
      name: mine.name,
      description: mine.description,
      center: mine.center,
      zoom: mine.zoom,
      places: myPlaces.map((p) => ({
        name: p.name,
        category: p.category,
        lat: p.lat,
        lng: p.lng,
        address: p.address,
        notes: p.notes,
        photoUrl: p.photoUrl,
        placeId: p.placeId,
      })),
    }
  } catch {
    return null
  } finally {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  }
}

// Guards against duplicate concurrent hydrate() calls for the same user (e.g. React
// StrictMode double-invoking effects in dev) racing each other into inserting two
// starter collections. Keyed by user id so switching accounts still hydrates fresh.
let hydratingUserId: string | null = null
let hydratingPromise: Promise<void> | null = null

/** Called once per sign-in (on initial session + on auth state change) to load your real data. */
export async function hydrate(user: User) {
  if (hydratingUserId === user.id && hydratingPromise) return hydratingPromise
  hydratingUserId = user.id
  hydratingPromise = hydrateInner(user).finally(() => {
    hydratingUserId = null
    hydratingPromise = null
  })
  return hydratingPromise
}

async function hydrateInner(user: User) {
  const me: Creator = {
    id: user.id,
    handle: deriveHandle(user),
    name: (user.user_metadata?.full_name as string) || deriveHandle(user),
    avatarUrl: (user.user_metadata?.avatar_url as string) || `https://api.dicebear.com/9.x/notionists/svg?seed=${user.id}`,
    bio: 'Curating spots worth remembering.',
    followerCount: 0,
    followingCount: 0,
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    handle: me.handle,
    name: me.name,
    avatar_url: me.avatarUrl,
  })

  const [{ data: collectionRows }, { data: followRows }] = await Promise.all([
    supabase.from('collections').select('*').eq('owner_id', user.id),
    supabase.from('followed_creators').select('creator_id').eq('user_id', user.id),
  ])

  let collections = (collectionRows ?? []).map(collectionFromRow)
  let places: Place[] = []

  if (collections.length > 0) {
    const { data: placeRows } = await supabase
      .from('places')
      .select('*')
      .in('collection_id', collections.map((c) => c.id))
    places = (placeRows ?? []).map(placeFromRow)
  } else {
    // Brand-new account: either bring over pre-auth local test data, or seed the starter Lisbon collection.
    const imported = importLegacyLocalData()
    const { lisbon, places: starterPlaces } = starterLisbonSeed(user.id)
    const seed = imported ?? { ...lisbon, places: starterPlaces }

    const newCollection: Collection = {
      id: crypto.randomUUID(),
      creatorId: user.id,
      name: seed.name,
      description: seed.description,
      center: seed.center,
      zoom: seed.zoom,
      createdAt: Date.now(),
    }

    const { data: insertedCollection } = await supabase
      .from('collections')
      .insert(collectionToRow(newCollection))
      .select()
      .single()

    if (insertedCollection) {
      const collection = collectionFromRow(insertedCollection)
      const seedPlaces: Place[] = seed.places.map((p) => ({
        ...p,
        id: crypto.randomUUID(),
        collectionId: collection.id,
        createdAt: Date.now(),
      }))
      if (seedPlaces.length > 0) {
        await supabase.from('places').insert(seedPlaces.map(placeToRow))
      }
      collections = [collection]
      places = seedPlaces
    }
  }

  let followedCreatorIds = (followRows ?? []).map((f) => f.creator_id as string)
  if (followedCreatorIds.length === 0) {
    // Brand-new (or previously-follow-free) account — auto-follow a starter set of
    // popular creators so the Home feed isn't empty on day one.
    followedCreatorIds = DEFAULT_FOLLOW_IDS
    await supabase
      .from('followed_creators')
      .upsert(DEFAULT_FOLLOW_IDS.map((creatorId) => ({ user_id: user.id, creator_id: creatorId })))
  }

  set((s) => ({
    ...s,
    authStatus: 'signedIn',
    userId: user.id,
    creators: [me, ...MOCK_CREATORS],
    collections: [...collections, ...MOCK_COLLECTIONS],
    places: [...places, ...MOCK_PLACES],
    followedCreatorIds,
    activeCollectionId: collections[0]?.id ?? null,
  }))
}

export function markSignedOut() {
  set(() => ({ ...initial, authStatus: 'signedOut' }))
}

export async function signOut() {
  await supabase.auth.signOut()
  markSignedOut()
}

// ---- actions ----------------------------------------------------------------

export const actions = {
  createCollection(input: { name: string; description?: string; center?: { lat: number; lng: number }; zoom?: number }): string {
    if (!state.userId) throw new Error('Not signed in')
    const collection: Collection = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      center: input.center,
      zoom: input.zoom,
      createdAt: Date.now(),
      creatorId: state.userId,
    }
    set((s) => ({
      ...s,
      collections: [...s.collections, collection],
      activeCollectionId: collection.id,
      selectedPlaceId: null,
    }))
    supabase.from('collections').insert(collectionToRow(collection)).then(({ error }) => logWriteError('createCollection', error))
    return collection.id
  },

  renameCollection(collectionId: string, name: string) {
    set((s) => ({
      ...s,
      collections: s.collections.map((c) => (c.id === collectionId ? { ...c, name } : c)),
    }))
    supabase.from('collections').update({ name }).eq('id', collectionId).then(({ error }) => logWriteError('renameCollection', error))
  },

  deleteCollection(collectionId: string) {
    set((s) => {
      const remaining = s.collections.filter((c) => c.id !== collectionId)
      return {
        ...s,
        collections: remaining,
        places: s.places.filter((p) => p.collectionId !== collectionId),
        activeCollectionId:
          s.activeCollectionId === collectionId ? remaining[0]?.id ?? null : s.activeCollectionId,
        selectedPlaceId: null,
      }
    })
    // Places cascade-delete on the DB side (FK `on delete cascade`).
    supabase.from('collections').delete().eq('id', collectionId).then(({ error }) => logWriteError('deleteCollection', error))
  },

  setActiveCollection(collectionId: string | null) {
    set((s) => ({ ...s, activeCollectionId: collectionId, selectedPlaceId: null }))
  },

  addPlace(input: Omit<Place, 'id' | 'createdAt'>): string {
    const place: Place = { ...input, id: crypto.randomUUID(), createdAt: Date.now() }
    set((s) => ({ ...s, places: [...s.places, place], selectedPlaceId: place.id }))
    supabase.from('places').insert(placeToRow(place)).then(({ error }) => logWriteError('addPlace', error))
    return place.id
  },

  updatePlace(placeId: string, patch: Partial<Omit<Place, 'id' | 'createdAt' | 'collectionId'>>) {
    set((s) => ({
      ...s,
      places: s.places.map((p) => (p.id === placeId ? { ...p, ...patch } : p)),
    }))
    const row: Record<string, unknown> = {}
    if (patch.name !== undefined) row.name = patch.name
    if (patch.category !== undefined) row.category = patch.category
    if (patch.address !== undefined) row.address = patch.address
    if (patch.notes !== undefined) row.notes = patch.notes
    if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl
    if (patch.instagramUrl !== undefined) row.instagram_url = patch.instagramUrl
    if (patch.lat !== undefined) row.lat = patch.lat
    if (patch.lng !== undefined) row.lng = patch.lng
    if (patch.phoneNumber !== undefined) row.phone_number = patch.phoneNumber
    if (patch.priceLevel !== undefined) row.price_level = patch.priceLevel
    if (patch.openingHours !== undefined) row.opening_hours = patch.openingHours
    if (patch.googleMapsUri !== undefined) row.google_maps_uri = patch.googleMapsUri
    if (patch.businessStatus !== undefined) row.business_status = patch.businessStatus
    supabase.from('places').update(row).eq('id', placeId).then(({ error }) => logWriteError('updatePlace', error))
  },

  deletePlace(placeId: string) {
    set((s) => ({
      ...s,
      places: s.places.filter((p) => p.id !== placeId),
      selectedPlaceId: s.selectedPlaceId === placeId ? null : s.selectedPlaceId,
    }))
    supabase.from('places').delete().eq('id', placeId).then(({ error }) => logWriteError('deletePlace', error))
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

  followCreator(creatorId: string) {
    if (!state.userId) return
    set((s) => ({
      ...s,
      followedCreatorIds: s.followedCreatorIds.includes(creatorId)
        ? s.followedCreatorIds
        : [...s.followedCreatorIds, creatorId],
    }))
    supabase
      .from('followed_creators')
      .upsert({ user_id: state.userId, creator_id: creatorId })
      .then(({ error }) => logWriteError('followCreator', error))
  },

  unfollowCreator(creatorId: string) {
    if (!state.userId) return
    set((s) => ({
      ...s,
      followedCreatorIds: s.followedCreatorIds.filter((id) => id !== creatorId),
    }))
    supabase
      .from('followed_creators')
      .delete()
      .eq('user_id', state.userId)
      .eq('creator_id', creatorId)
      .then(({ error }) => logWriteError('unfollowCreator', error))
  },

  goToTab(tab: Tab) {
    set((s) => ({ ...s, tab, detail: null }))
  },

  openDetail(detail: Detail) {
    set((s) => ({ ...s, detail }))
  },

  closeDetail() {
    set((s) => ({ ...s, detail: null }))
  },
}
