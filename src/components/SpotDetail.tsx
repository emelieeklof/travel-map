import { ChevronLeft } from 'lucide-react'
import { actions } from '../store'
import { SpotDetailContent } from './SpotDetailContent'

export function SpotDetail({ placeId }: { placeId: string }) {
  return (
    <div className="relative h-full w-full overflow-y-auto bg-surface pb-8">
      <button
        onClick={() => actions.closeDetail()}
        className="absolute top-4 left-4 z-10 h-9 w-9 rounded-full bg-surface/90 flex items-center justify-center shadow-card"
      >
        <ChevronLeft size={20} />
      </button>
      <SpotDetailContent placeId={placeId} />
    </div>
  )
}
