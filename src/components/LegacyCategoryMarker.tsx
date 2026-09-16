import { useEffect, useState } from 'react'
import { Marker } from '@vis.gl/react-google-maps'
import { categoryById, categorySvgPath } from '../categories'
import type { CustomCategory, Place } from '../types'

type Props = {
  place: Place
  selected: boolean
  onClick: () => void
  customCategories: readonly CustomCategory[]
}

/**
 * Renders a saved place as a legacy <Marker> with an SVG-data-URI icon.
 *
 * Used in focus mode, where the map drops its mapId (so styles can hide POIs) —
 * AdvancedMarker doesn't render on raster maps, so we fall back to this.
 *
 * Wait for `google.maps.Size` / `google.maps.Point` to exist before passing the
 * icon options (those constructors aren't on the global until the JS API loads).
 */
export function LegacyCategoryMarker({ place, selected, onClick, customCategories }: Props) {
  const icon = useMarkerIcon(place.category, selected, customCategories)
  if (!icon) return null
  return (
    <Marker
      position={{ lat: place.lat, lng: place.lng }}
      onClick={onClick}
      title={place.name}
      icon={icon}
      zIndex={selected ? 1000 : undefined}
    />
  )
}

function useMarkerIcon(
  categoryId: Place['category'],
  selected: boolean,
  customCategories: readonly CustomCategory[],
): google.maps.Icon | null {
  const [icon, setIcon] = useState<google.maps.Icon | null>(null)
  useEffect(() => {
    if (!window.google?.maps?.Size) return
    const category = categoryById(categoryId, customCategories)
    const size = selected ? 42 : 34
    const iconSize = selected ? 20 : 16
    const offset = (size - iconSize) / 2
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${category.color}" stroke="white" stroke-width="2"/>
        <g transform="translate(${offset} ${offset}) scale(${iconSize / 24})" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          ${categorySvgPath(categoryId)}
        </g>
      </svg>`
    setIcon({
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    })
  }, [categoryId, selected, customCategories])
  return icon
}
