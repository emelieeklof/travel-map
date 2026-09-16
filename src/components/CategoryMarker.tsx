import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { categoryById } from '../categories'
import type { CustomCategory, Place } from '../types'

type Props = {
  place: Place
  selected: boolean
  onClick: () => void
  customCategories: readonly CustomCategory[]
}

export function CategoryMarker({ place, selected, onClick, customCategories }: Props) {
  const category = categoryById(place.category, customCategories)
  const Icon = category.icon
  return (
    <AdvancedMarker
      position={{ lat: place.lat, lng: place.lng }}
      onClick={onClick}
      zIndex={selected ? 1000 : undefined}
      title={place.name}
    >
      <div
        className={
          'relative flex items-center justify-center rounded-full shadow-md ring-2 transition-all ' +
          (selected
            ? 'h-10 w-10 ring-white scale-110'
            : 'h-8 w-8 ring-white/90 hover:scale-110')
        }
        style={{ backgroundColor: category.color }}
      >
        <Icon className={selected ? 'h-5 w-5 text-white' : 'h-4 w-4 text-white'} strokeWidth={2.5} />
        <div
          className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
          style={{ backgroundColor: category.color }}
        />
      </div>
    </AdvancedMarker>
  )
}
