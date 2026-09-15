import { Compass } from 'lucide-react'
import { useAppState, actions } from '../store'
import { CATEGORY_BY_ID } from '../categories'
import { MOCK_FEED_ITEMS } from '../mockCreators'

function relativeTime(ms: number): string {
  const diff = Date.now() - ms
  const minutes = Math.round(diff / (1000 * 60))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function FollowingFeed() {
  const followedCreatorIds = useAppState((s) => s.followedCreatorIds)
  const creators = useAppState((s) => s.creators)
  const collections = useAppState((s) => s.collections)
  const places = useAppState((s) => s.places)

  const feedItems = MOCK_FEED_ITEMS
    .map((item) => {
      const place = places.find((p) => p.id === item.placeId)
      if (!place) return null
      const collection = collections.find((c) => c.id === place.collectionId)
      if (!collection) return null
      const creator = creators.find((c) => c.id === collection.creatorId)
      if (!creator || !followedCreatorIds.includes(creator.id)) return null
      return { place, collection, creator, addedAt: item.addedAt }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.addedAt - a.addedAt)

  if (followedCreatorIds.length === 0) {
    return (
      <div className="h-full w-full overflow-y-auto bg-surface pb-20 flex items-center justify-center px-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/15 text-primary mb-4">
            <Compass size={22} />
          </div>
          <p className="text-sm font-medium text-on-surface">Follow some creators to see their spots here</p>
          <p className="mt-1 text-xs text-on-surface-variant">Newly added spots from people you follow will show up in this feed.</p>
          <button
            onClick={() => actions.goToTab('explore')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            Explore creators
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-surface pb-20">
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md px-4 pt-4 pb-3 border-b border-outline-variant/40">
        <h1 className="font-sans text-2xl font-bold text-on-surface">Home</h1>
      </div>

      <div className="px-4 pt-3">
        {feedItems.length === 0 && (
          <div className="text-center text-outline text-sm py-12">
            No recent activity from creators you follow yet.
          </div>
        )}
        {feedItems.map(({ place, collection, creator, addedAt }) => {
          const cat = CATEGORY_BY_ID[place.category]
          return (
            <button
              key={place.id}
              onClick={() => actions.openDetail({ type: 'spot', id: place.id })}
              className="flex w-full items-center gap-3 py-3 border-b border-outline-variant/30 text-left"
            >
              <div className="h-14 w-14 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                {place.photoUrl ? (
                  <img src={place.photoUrl} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center" style={{ background: `${cat.color}22` }}>
                    <cat.icon size={18} color={cat.color} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <img src={creator.avatarUrl} alt="" className="h-4 w-4 rounded-full bg-surface-container-high" />
                  <span className="text-xs font-semibold text-on-surface truncate">@{creator.handle}</span>
                  <span className="text-xs text-outline">· {relativeTime(addedAt)}</span>
                </div>
                <div className="text-sm font-semibold text-on-surface truncate mt-0.5">{place.name}</div>
                <div className="text-xs text-on-surface-variant truncate">added to {collection.name}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
