import {
  Utensils,
  Camera,
  ShoppingBag,
  Wine,
  Mountain,
  MapPin,
  type LucideIcon,
} from 'lucide-react'

export type CategoryId =
  | 'eating'
  | 'sightseeing'
  | 'shopping'
  | 'bars'
  | 'activities'
  | 'other'

export type Category = {
  id: CategoryId
  label: string
  /** Hex color used for the pin background and accent UI. */
  color: string
  icon: LucideIcon
}

export const CATEGORIES: readonly Category[] = [
  { id: 'eating', label: 'Eating', color: '#ef4444', icon: Utensils },
  { id: 'sightseeing', label: 'Sightseeing', color: '#8b5cf6', icon: Camera },
  { id: 'shopping', label: 'Shopping', color: '#f59e0b', icon: ShoppingBag },
  { id: 'bars', label: 'Bars', color: '#ec4899', icon: Wine },
  { id: 'activities', label: 'Activities', color: '#10b981', icon: Mountain },
  { id: 'other', label: 'Other', color: '#64748b', icon: MapPin },
]

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>

/**
 * Raw SVG path markup (in a 24x24 viewBox) for each category icon. Used to render
 * legacy <Marker> icons via data URIs in focus mode, where AdvancedMarker doesn't
 * render (focus mode drops the mapId so styles work, which means raster map).
 */
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
}
