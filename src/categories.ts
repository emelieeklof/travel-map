import {
  Utensils,
  UtensilsCrossed,
  Coffee,
  Shirt,
  Camera,
  ShoppingBag,
  Wine,
  Mountain,
  MapPin,
  Waves,
  IceCreamCone,
  Palette,
  Landmark,
  type LucideIcon,
} from 'lucide-react'
import { SurfingIcon } from './components/SurfingIcon'
import type { CustomCategory } from './types'
import { CUSTOM_CATEGORY_ICONS } from './customCategoryIcons'

export type CategoryId =
  | 'eating'
  | 'sightseeing'
  | 'shopping'
  | 'bars'
  | 'activities'
  | 'other'
  | 'thrifting'
  | 'restaurant'
  | 'cafe'
  | 'surfing'
  | 'surf'
  | 'gelato'
  | 'art'
  | 'museum'

export type Category = {
  id: CategoryId
  label: string
  /** Hex color used for the pin background and accent UI. */
  color: string
  icon: LucideIcon
}

export const CATEGORIES: readonly Category[] = [
  { id: 'eating', label: 'Eating', color: '#a13920', icon: Utensils },
  { id: 'sightseeing', label: 'Sightseeing', color: '#3e616f', icon: Camera },
  { id: 'shopping', label: 'Shopping', color: '#466556', icon: ShoppingBag },
  { id: 'bars', label: 'Bars', color: '#c25136', icon: Wine },
  { id: 'activities', label: 'Activities', color: '#466556', icon: Mountain },
  { id: 'other', label: 'Other', color: '#57423d', icon: MapPin },
  { id: 'thrifting', label: 'Thrifting', color: '#7a5c8e', icon: Shirt },
  { id: 'restaurant', label: 'Restaurant', color: '#8e5c4c', icon: UtensilsCrossed },
  { id: 'cafe', label: 'Cafe', color: '#b8863f', icon: Coffee },
  { id: 'surfing', label: 'Swimming', color: '#3e8e8e', icon: Waves },
  { id: 'surf', label: 'Surfing', color: '#2e7d8e', icon: SurfingIcon as unknown as LucideIcon },
  { id: 'gelato', label: 'Gelato', color: '#c98a4b', icon: IceCreamCone },
  { id: 'art', label: 'Art', color: '#9e5c8e', icon: Palette },
  { id: 'museum', label: 'Museum', color: '#6b5c3e', icon: Landmark },
]

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>

/**
 * Raw SVG path markup (in a 24x24 viewBox) for each category icon. Used to render
 * legacy <Marker> icons via data URIs in focus mode, where AdvancedMarker doesn't
 * render (focus mode drops the mapId so styles work, which means raster map).
 */
/**
 * Looks up a category by id across the built-in set and a user's custom
 * categories, falling back to "Other" for an id that matches neither
 * (e.g. stale data, or a category owned by someone else).
 */
export function categoryById(id: string, customCategories: readonly CustomCategory[]): Category {
  const builtin = CATEGORY_BY_ID[id as CategoryId]
  if (builtin) return builtin
  const custom = customCategories.find((c) => c.id === id)
  if (custom) {
    return {
      id: custom.id as CategoryId,
      label: custom.label,
      color: custom.color,
      icon: CUSTOM_CATEGORY_ICONS[custom.icon] ?? CUSTOM_CATEGORY_ICONS.tag,
    }
  }
  return CATEGORY_BY_ID.other
}

/**
 * All categories (built-in + this user's custom ones) in the order they should be
 * listed anywhere a full list is shown: alphabetical by label, with "Other" always last.
 */
export function allCategoriesSorted(customCategories: readonly CustomCategory[]): Category[] {
  const custom = customCategories.map((c) => categoryById(c.id, customCategories))
  const rest = [...CATEGORIES.filter((c) => c.id !== 'other'), ...custom]
  rest.sort((a, b) => a.label.localeCompare(b.label))
  return [...rest, CATEGORY_BY_ID.other]
}

/** SVG path (24x24 viewBox) used for legacy/focus-mode raster markers — no per-icon
 * path data exists for custom categories, so they fall back to the generic "Other" pin. */
export function categorySvgPath(id: string): string {
  return CATEGORY_SVG_PATHS[id as CategoryId] ?? CATEGORY_SVG_PATHS.other
}

export const CATEGORY_SVG_PATHS: Record<CategoryId, string> = {
  eating:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  sightseeing:
    '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  shopping:
    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  bars:
    '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-3.5-2-8.5h-6c-1.5 5-2 6.5-2 8.5a5 5 0 0 0 5 5Z"/>',
  activities: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  other:
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  thrifting:
    '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  restaurant:
    '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6L8 14"/><path d="m4 12.4 6.1 6.1"/><path d="M7 22 11 18"/><path d="m17 15 1.4 1.4"/><path d="m21 21-2.4-2.4"/>',
  cafe:
    '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
  surfing:
    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.6 2 5.1 2 2.6 0 2.6-2 5.1-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.6 2 5.1 2 2.6 0 2.6-2 5.1-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.6 2 5.1 2 2.6 0 2.6-2 5.1-2 1.3 0 1.9.5 2.5 1"/>',
  surf:
    '<path d="M13 3c1.6 2.3 2.2 7 1.6 12-.3 2.3-.8 4-1.1 5.2l-.5-.7-.5.7c-.3-1.2-.8-2.9-1.1-5.2-.6-5 0-9.7 1.6-12Z"/><path d="M2 20.5c2.2-1.3 4.4-1.3 6.6 0s4.4 1.3 6.6 0 4.4-1.3 6.6 0"/>',
  gelato:
    '<path d="M8.5 11 12 21l3.5-10Z"/><circle cx="12" cy="8" r="4"/>',
  art:
    '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8Z"/><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/>',
  museum:
    '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m3 11 9-7 9 7Z"/>',
}
