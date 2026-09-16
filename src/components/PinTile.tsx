import { categoryById } from '../categories'
import type { Place } from '../types'
import { actions, useAppState } from '../store'

export function PinTile({ place }: { place: Place }) {
  const customCategories = useAppState((s) => s.customCategories)
  const cat = categoryById(place.category, customCategories)
  return (
    <button
      onClick={() => actions.openDetail({ type: 'spot', id: place.id })}
      className="rounded-md overflow-hidden bg-surface-container-lowest shadow-card border border-outline-variant/40 text-left"
    >
      <div className="h-28 bg-surface-container-high">
        {place.photoUrl ? (
          <img src={place.photoUrl} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="h-full w-full flex items-center justify-center" style={{ background: `${cat.color}22` }}>
            <cat.icon size={22} color={cat.color} />
          </div>
        )}
      </div>
      <div className="px-3 pt-3 pb-4 text-sm font-medium text-on-surface truncate">{place.name}</div>
    </button>
  )
}
