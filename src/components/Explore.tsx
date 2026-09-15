import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAppState } from '../store'
import { CollectionCard } from './CollectionCard'
import { CATEGORY_BY_ID, type CategoryId } from '../categories'
import type { Collection } from '../types'

function topOwnCategory(places: { collectionId: string; category: CategoryId }[], ownCollectionIds: Set<string>): CategoryId | null {
  const counts: Partial<Record<CategoryId, number>> = {}
  for (const p of places) {
    if (!ownCollectionIds.has(p.collectionId)) continue
    counts[p.category] = (counts[p.category] ?? 0) + 1
  }
  let best: CategoryId | null = null
  let bestCount = 0
  for (const [cat, count] of Object.entries(counts)) {
    if (count! > bestCount) {
      best = cat as CategoryId
      bestCount = count!
    }
  }
  return best
}

export function Explore() {
  const collections = useAppState((s) => s.collections)
  const creators = useAppState((s) => s.creators)
  const places = useAppState((s) => s.places)
  const followedCreatorIds = useAppState((s) => s.followedCreatorIds)
  const userId = useAppState((s) => s.userId)
  const [query, setQuery] = useState('')

  const creatorById = Object.fromEntries(creators.map((c) => [c.id, c]))
  const pinCount = (c: Collection) => places.filter((p) => p.collectionId === c.id).length

  if (query.trim() !== '') {
    const filtered = collections.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    return (
      <div className="h-full w-full overflow-y-auto bg-surface pb-20">
        <ExploreHeader query={query} setQuery={setQuery} />
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {filtered.map((c) => (
            <CollectionCard key={c.id} collection={c} creator={creatorById[c.creatorId]} pinCount={pinCount(c)} places={places} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center text-outline text-sm py-12">No collections match "{query}".</div>
          )}
        </div>
      </div>
    )
  }

  const ownCollectionIds = new Set(collections.filter((c) => c.creatorId === userId).map((c) => c.id))
  const topCategory = topOwnCategory(places, ownCollectionIds)

  const fromFollowed = collections.filter((c) => c.creatorId !== userId && followedCreatorIds.includes(c.creatorId))
  const fromFollowedIds = new Set(fromFollowed.map((c) => c.id))

  const byTopCategory = topCategory
    ? collections.filter(
        (c) =>
          c.creatorId !== userId &&
          !fromFollowedIds.has(c.id) &&
          places.some((p) => p.collectionId === c.id && p.category === topCategory),
      )
    : []
  const byTopCategoryIds = new Set(byTopCategory.map((c) => c.id))

  const rest = collections.filter((c) => !fromFollowedIds.has(c.id) && !byTopCategoryIds.has(c.id))

  return (
    <div className="h-full w-full overflow-y-auto bg-surface pb-20">
      <ExploreHeader query={query} setQuery={setQuery} />
      <div className="px-4 pt-4">
        {fromFollowed.length > 0 && (
          <Section title="From creators you follow">
            {fromFollowed.map((c) => (
              <CollectionCard key={c.id} collection={c} creator={creatorById[c.creatorId]} pinCount={pinCount(c)} places={places} />
            ))}
          </Section>
        )}
        {byTopCategory.length > 0 && topCategory && (
          <Section title={`More ${CATEGORY_BY_ID[topCategory].label.toLowerCase()}`}>
            {byTopCategory.map((c) => (
              <CollectionCard key={c.id} collection={c} creator={creatorById[c.creatorId]} pinCount={pinCount(c)} places={places} />
            ))}
          </Section>
        )}
        {rest.length > 0 && (
          <Section title="Popular collections">
            {rest.map((c) => (
              <CollectionCard key={c.id} collection={c} creator={creatorById[c.creatorId]} pinCount={pinCount(c)} places={places} />
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

function ExploreHeader({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
  return (
    <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md px-4 pt-4 pb-3 border-b border-outline-variant/40">
      <h1 className="font-sans text-2xl font-bold text-on-surface mb-3">Explore</h1>
      <div className="flex items-center gap-2 rounded-full bg-surface-container-lowest shadow-card px-4 py-2.5">
        <Search size={18} className="text-outline" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Discover new gems..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-outline"
        />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-bold uppercase tracking-wide text-outline mb-2">{title}</div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}
