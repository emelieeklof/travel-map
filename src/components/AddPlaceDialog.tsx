import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES, type CategoryId } from '../categories'
import type { PickedPlace } from './PlaceSearch'

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
  }) => void
}

export function AddPlaceDialog({ picked, onCancel, onSave }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CategoryId>('eating')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (picked) {
      setName(picked.name)
      setNotes('')
      setCategory(picked.preferredCategory ?? guessCategory(picked.name))
    }
  }, [picked])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    if (picked) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picked, onCancel])

  if (!picked) return null

  const submit = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      category,
      notes: notes.trim() || undefined,
      lat: picked.lat,
      lng: picked.lng,
      address: picked.address,
      placeId: picked.placeId,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between px-5 pt-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Save place</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Add it to your current list and tag a category.</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
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
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </Field>

          {picked.address && (
            <div className="-mt-2 text-xs text-zinc-500">{picked.address}</div>
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
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300')
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

          <Field label="Notes" optional>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Why this place? Tips, opening hours, what to order…"
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save place
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
      <div className="mb-1.5 flex items-baseline gap-1.5 text-xs font-medium text-zinc-700">
        {label}
        {optional && <span className="text-[10px] font-normal text-zinc-400">optional</span>}
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
