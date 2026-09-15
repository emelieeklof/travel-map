import { useEffect, useMemo, useState } from 'react'
import { X, Check } from 'lucide-react'
import { CATEGORIES, type CategoryId } from '../categories'
import type { PickedPlace } from './PlaceSearch'
import { actions, useAppState } from '../store'

type Props = {
  picked: PickedPlace | null
  onCancel: () => void
  onSave: (input: {
    name: string
    category: CategoryId
    notes?: string
    lat: number
    lng: number
    address?: string
    placeId?: string
    photoUrl?: string
    instagramUrl?: string
    collectionId: string
  }) => void
}

export function AddPlaceDialog({ picked, onCancel, onSave }: Props) {
  const userId = useAppState((s) => s.userId)
  const allCollections = useAppState((s) => s.collections)
  const myCollections = useMemo(
    () => allCollections.filter((c) => c.creatorId === userId),
    [allCollections, userId],
  )

  const [name, setName] = useState('')
  const [category, setCategory] = useState<CategoryId>('eating')
  const [notes, setNotes] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)

  useEffect(() => {
    if (picked) {
      setName(picked.name)
      setNotes('')
      setInstagramUrl(picked.instagramUrl ?? '')
      setCategory(picked.preferredCategory ?? guessCategory(picked.name))
      setCollectionId(myCollections[0]?.id ?? null)
      setCreatingNew(myCollections.length === 0)
      setNewCollectionName('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    if (picked) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picked, onCancel])

  if (!picked) return null

  const canSubmit = name.trim() && (creatingNew ? newCollectionName.trim() : collectionId)

  const submit = () => {
    if (!canSubmit) return
    const finalCollectionId = creatingNew
      ? actions.createCollection({ name: newCollectionName.trim() })
      : collectionId!
    onSave({
      name: name.trim(),
      category,
      notes: notes.trim() || undefined,
      lat: picked.lat,
      lng: picked.lng,
      address: picked.address,
      placeId: picked.placeId,
      photoUrl: picked.photoUrl,
      instagramUrl: instagramUrl.trim() || undefined,
      collectionId: finalCollectionId,
    })
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-on-surface/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90%] overflow-y-auto rounded-md bg-surface-container-lowest shadow-float">
        <div className="flex items-start justify-between px-5 pt-5">
          <div>
            <h2 className="font-serif-display text-base font-semibold text-on-surface">Save spot</h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">Tag a category and choose where to save it.</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1 text-outline hover:bg-surface-container hover:text-on-surface"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <Field label="Name">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </Field>

          {picked.address && (
            <div className="-mt-2 text-xs text-on-surface-variant">{picked.address}</div>
          )}

          <Field label="Category">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const Icon = c.icon
                const active = c.id === category
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ' +
                      (active
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-outline')
                    }
                    style={active ? { backgroundColor: c.color } : undefined}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2.5} />
                    {c.label}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Collection">
            <div className="space-y-1.5">
              {myCollections.map((c) => {
                const active = !creatingNew && collectionId === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCreatingNew(false)
                      setCollectionId(c.id)
                    }}
                    className={
                      'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm ' +
                      (active
                        ? 'border-primary bg-primary-container/10 text-on-surface'
                        : 'border-outline-variant text-on-surface-variant')
                    }
                  >
                    {c.name}
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setCreatingNew(true)}
                className={
                  'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ' +
                  (creatingNew
                    ? 'border-primary bg-primary-container/10 text-on-surface'
                    : 'border-outline-variant text-on-surface-variant')
                }
              >
                {creatingNew ? (
                  <input
                    autoFocus
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="New collection name…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-outline"
                  />
                ) : (
                  '+ New collection…'
                )}
              </button>
            </div>
          </Field>

          <Field label="Notes" optional>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Why this place? Tips, opening hours, what to order…"
              className="w-full resize-none rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </Field>

          <Field label="Instagram" optional>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-outline-variant px-5 py-3">
          <button
            onClick={onCancel}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-on-primary hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save spot
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline gap-1.5 text-xs font-medium text-on-surface-variant">
        {label}
        {optional && <span className="text-[10px] font-normal text-outline">optional</span>}
      </div>
      {children}
    </label>
  )
}

/** Best-effort category guess from the place name so the right chip is preselected. */
function guessCategory(name: string): CategoryId {
  const n = name.toLowerCase()
  if (/(restaurant|café|cafe|bistro|pizzeria|trattoria|ramen|sushi|bakery|patisserie|brunch|tavern|deli|burger|kitchen|grill)/.test(n))
    return 'eating'
  if (/(bar|pub|cocktail|wine|brewery|lounge|club)/.test(n)) return 'bars'
  if (/(museum|gallery|cathedral|church|monastery|palace|castle|monument|viewpoint|miradouro|tower|temple|park|garden)/.test(n))
    return 'sightseeing'
  if (/(market|shop|store|boutique|mall|factory)/.test(n)) return 'shopping'
  if (/(hike|trail|tour|spa|surf|kayak|class|workshop|cinema|theater|theatre)/.test(n))
    return 'activities'
  return 'other'
}
