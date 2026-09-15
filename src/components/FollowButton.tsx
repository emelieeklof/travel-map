import { useAppState, actions } from '../store'

export function FollowButton({ creatorId, className = '' }: { creatorId: string; className?: string }) {
  const isFollowing = useAppState((s) => s.followedCreatorIds.includes(creatorId))
  const isMe = useAppState((s) => s.userId === creatorId)
  if (isMe) return null

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (isFollowing) actions.unfollowCreator(creatorId)
        else actions.followCreator(creatorId)
      }}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        isFollowing
          ? 'bg-surface-container-high text-on-surface border border-outline-variant'
          : 'bg-primary text-on-primary'
      } ${className}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
