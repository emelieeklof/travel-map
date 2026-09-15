export type LatLng = { lat: number; lng: number }
export type Viewport = { center: LatLng; zoom: number }

/**
 * Toggling focus mode forces the underlying Google Map to remount (mapId is
 * immutable on a live map instance). On that remount, prefer the last viewport
 * the user was actually looking at over the collection's stored default — that's
 * what keeps a manual zoom/pan from snapping back on every focus-mode toggle.
 */
export function resolveDefaultViewport(
  lastViewport: Viewport | null,
  collection: { center?: LatLng; zoom?: number } | null,
  fallback: Viewport,
): Viewport {
  if (lastViewport) return lastViewport
  if (collection?.center) return { center: collection.center, zoom: collection.zoom ?? fallback.zoom }
  return fallback
}
