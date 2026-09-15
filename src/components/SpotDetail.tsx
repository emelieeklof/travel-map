import { ChevronLeft, Bookmark, Navigation, Share2 } from 'lucide-react'

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  )
}
import { useAppState, actions } from '../store'
import { CATEGORY_BY_ID } from '../categories'

export function SpotDetail({ placeId }: { placeId: string }) {
  const places = useAppState((s) => s.places)
  const collections = useAppState((s) => s.collections)
  const creators = useAppState((s) => s.creators)
  const place = places.find((p) => p.id === placeId)
  if (!place) return null

  const collection = collections.find((c) => c.id === place.collectionId)
  const creator = creators.find((c) => c.id === collection?.creatorId)
  const cat = CATEGORY_BY_ID[place.category]

  // "Vibes from" — other pins with a similar name elsewhere, curated by other creators.
  const vibes = places.filter(
    (p) => p.id !== place.id && p.name.toLowerCase() === place.name.toLowerCase(),
  )

  const mapsQuery = encodeURIComponent(place.address ? `${place.name}, ${place.address}` : place.name)

  return (
    <div className="h-full w-full overflow-y-auto bg-surface pb-8">
      <div className="relative h-64 bg-surface-container-high">
        {place.photoUrl ? (
          <img src={place.photoUrl} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="h-full w-full flex items-center justify-center" style={{ background: `${cat.color}22` }}>
            <cat.icon size={40} color={cat.color} />
          </div>
        )}
        <button
          onClick={() => actions.closeDetail()}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-surface/90 flex items-center justify-center shadow-card"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="px-4 -mt-6 relative">
        <div className="rounded-md bg-surface-container-lowest shadow-float p-4">
          <div className="font-serif-display text-xl font-semibold text-on-surface">{place.name}</div>
          <div className="text-sm text-on-surface-variant mt-1">{place.address ?? cat.label}</div>

          <div className="flex items-center gap-2 mt-4">
            <ActionPill icon={Bookmark} label="Save" onClick={() => {}} />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface border border-outline-variant"
            >
              <Navigation size={16} /> Direction
            </a>
            {place.instagramUrl && (
              <a
                href={place.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface border border-outline-variant"
              >
                <InstagramIcon size={16} /> Instagram
              </a>
            )}
            <ActionPill icon={Share2} label="Share" onClick={() => {}} />
          </div>

          {place.notes && <p className="text-sm text-on-surface-variant mt-4 leading-relaxed">{place.notes}</p>}

          {creator && (
            <button
              onClick={() => actions.openDetail({ type: 'creator', id: creator.id })}
              className="flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant/50 w-full"
            >
              <img src={creator.avatarUrl} alt="" className="h-7 w-7 rounded-full bg-surface-container-high" />
              <span className="text-sm text-on-surface-variant">Curated by</span>
              <span className="text-sm font-semibold text-on-surface">@{creator.handle}</span>
            </button>
          )}
        </div>

        {vibes.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-outline mb-2">
              Vibes from other creators
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {vibes.map((v) => {
                const vc = collections.find((c) => c.id === v.collectionId)
                const vCreator = creators.find((c) => c.id === vc?.creatorId)
                return (
                  <div key={v.id} className="w-32 shrink-0 rounded-md overflow-hidden bg-surface-container-lowest shadow-card">
                    <div className="h-24 bg-surface-container-high">
                      {v.photoUrl && <img src={v.photoUrl} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-semibold text-on-surface truncate">@{vCreator?.handle ?? 'creator'}</div>
                      <div className="text-[11px] text-on-surface-variant line-clamp-2">{v.notes}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionPill({ icon: Icon, label, onClick }: { icon: typeof Bookmark; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface border border-outline-variant"
    >
      <Icon size={16} /> {label}
    </button>
  )
}
