import { useState } from 'react'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import { useAppState, actions, signOut } from '../store'
import { FollowButton } from './FollowButton'
import { CollectionCard } from './CollectionCard'
import { PinTile } from './PinTile'
import { CATEGORIES } from '../categories'

export function Profile({ creatorId }: { creatorId?: string }) {
  const myUserId = useAppState((s) => s.userId)
  const id = creatorId ?? myUserId ?? ''
  const creators = useAppState((s) => s.creators)
  const collections = useAppState((s) => s.collections)
  const places = useAppState((s) => s.places)
  const followedIds = useAppState((s) => s.followedCreatorIds)
  const [view, setView] = useState<'collections' | 'pins'>('collections')

  const creator = creators.find((c) => c.id === id)
  const myCollections = collections.filter((c) => c.creatorId === id)
  const myPins = places.filter((p) => myCollections.some((c) => c.id === p.collectionId))
  const isMe = id === myUserId

  if (!creator) return null

  const followerCount = isMe ? 3 : creator.followerCount
  const followingCount = isMe ? followedIds.length : creator.followingCount

  return (
    <div className="h-full w-full overflow-y-auto bg-surface pb-20">
      <div className="flex items-center justify-between px-4 pt-4">
        {creatorId && !isMe ? (
          <button onClick={() => actions.closeDetail()} className="p-1">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span />
        )}
        {isMe ? (
          <button
            className="p-1 text-outline"
            onClick={() => {
              if (confirm('Sign out of SPOTTED?')) signOut()
            }}
            aria-label="Sign out"
          >
            <MoreHorizontal size={20} />
          </button>
        ) : (
          <span />
        )}
      </div>

      <div className="flex flex-col items-center px-4 pt-2 pb-4 text-center">
        <img src={creator.avatarUrl} alt="" className="h-20 w-20 rounded-full bg-surface-container-high mb-3" />
        <div className="font-sans text-xl font-bold text-on-surface">@{creator.handle}</div>
        {creator.bio && <div className="text-sm text-on-surface-variant mt-1 max-w-xs">{creator.bio}</div>}

        <div className="flex items-center gap-6 mt-4">
          <Stat label="Followers" value={followerCount} />
          <Stat label="Following" value={followingCount} />
          <Stat label="Collections" value={myCollections.length} />
        </div>

        {!isMe && (
          <div className="mt-4">
            <FollowButton creatorId={id} />
          </div>
        )}
      </div>

      <div className="flex border-b border-outline-variant/50 px-4">
        <TabButton label="Collections" active={view === 'collections'} onClick={() => setView('collections')} />
        <TabButton label="Pins" active={view === 'pins'} onClick={() => setView('pins')} />
      </div>

      {view === 'collections' ? (
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {myCollections.map((c) => (
            <CollectionCard
              key={c.id}
              collection={c}
              creator={undefined}
              pinCount={places.filter((p) => p.collectionId === c.id).length}
              places={places}
            />
          ))}
          {myCollections.length === 0 && (
            <div className="col-span-2 text-center text-outline text-sm py-12">No collections yet.</div>
          )}
        </div>
      ) : (
        <div className="px-4 pt-4">
          {CATEGORIES.map((cat) => {
            const items = myPins.filter((p) => p.category === cat.id)
            if (items.length === 0) return null
            return (
              <div key={cat.id} className="mb-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <cat.icon size={14} color={cat.color} strokeWidth={2.5} />
                  <span className="text-[11px] font-bold uppercase tracking-wide text-outline">{cat.label}</span>
                  <span className="text-[11px] text-outline">· {items.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((p) => (
                    <PinTile key={p.id} place={p} />
                  ))}
                </div>
              </div>
            )
          })}
          {myPins.length === 0 && (
            <div className="text-center text-outline text-sm py-12">No pins yet.</div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-semibold text-on-surface">{value.toLocaleString()}</div>
      <div className="text-[11px] uppercase tracking-wide text-outline">{label}</div>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 ${
        active ? 'border-primary text-primary' : 'border-transparent text-outline'
      }`}
    >
      {label}
    </button>
  )
}
