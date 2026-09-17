import { useEffect, useMemo, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { X, Check, Plus, Search, Loader2 } from 'lucide-react'
import { CATEGORIES, type CategoryId } from '../categories'
import { CUSTOM_CATEGORY_ICONS } from '../customCategoryIcons'
import type { PickedPlace } from './PlaceSearch'
import { AUTOCOMPLETE_FIELDS, placeResultToPicked } from '../lib/placeAutocomplete'
import { actions, useAppState } from '../store'

type Props = {
  picked: PickedPlace | null
  onCancel: () => void
  onSave: (input: {
    name: string
    category: string
    notes?: string
    lat: number
    lng: number
    address?: string
    placeId?: string
    photoUrl?: string
    instagramUrl?: string
    phoneNumber?: string
    priceLevel?: number
    openingHours?: string[]
    googleMapsUri?: string
    businessStatus?: string
    collectionId: string
  }) => void
  /** Called once the dialog is fully done (not staying open for another pin) —
   * with how many pins were created in this streak (0 if cancelled). */
  onDone: (createdCount: number) => void
}

export function AddPlaceDialog({ picked, onCancel, onSave, onDone }: Props) {
  const userId = useAppState((s) => s.userId)
  const allCollections = useAppState((s) => s.collections)
  const customCategories = useAppState((s) => s.customCategories)
  const myCollections = useMemo(
    () => allCollections.filter((c) => c.creatorId === userId),
    [allCollections, userId],
  )

  const [currentPlace, setCurrentPlace] = useState<PickedPlace | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('eating')
  const [notes, setNotes] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  const [creatingNewCategory, setCreatingNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [createAnother, setCreateAnother] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  const applyPicked = (p: PickedPlace) => {
    setCurrentPlace(p)
    setName(p.name)
    setInstagramUrl(p.instagramUrl ?? '')
    setCategory(p.preferredCategory ?? guessCategory(p.name))
  }

  useEffect(() => {
    if (picked) {
      applyPicked(picked)
      setNotes('')
      setCollectionId(myCollections[0]?.id ?? null)
      setCreatingNew(myCollections.length === 0)
      setNewCollectionName('')
      setCreatingNewCategory(false)
      setNewCategoryName('')
      setCreateAnother(false)
      setSessionCount(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked])

  const handleClose = () => {
    if (sessionCount > 0) onDone(sessionCount)
    else onCancel()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (picked) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked])

  if (!picked) return null

  const canSubmit = name.trim() && currentPlace && (creatingNew ? newCollectionName.trim() : collectionId)

  const submit = () => {
    if (!canSubmit || !currentPlace) return
    const finalCollectionId = creatingNew
      ? actions.createCollection({ name: newCollectionName.trim() })
      : collectionId!
    onSave({
      name: name.trim(),
      category,
      notes: notes.trim() || undefined,
      lat: currentPlace.lat,
      lng: currentPlace.lng,
      address: currentPlace.address,
      placeId: currentPlace.placeId,
      photoUrl: currentPlace.photoUrl,
      instagramUrl: instagramUrl.trim() || undefined,
      phoneNumber: currentPlace.phoneNumber,
      priceLevel: currentPlace.priceLevel,
      openingHours: currentPlace.openingHours,
      googleMapsUri: currentPlace.googleMapsUri,
      businessStatus: currentPlace.businessStatus,
      collectionId: finalCollectionId,
    })
    const newCount = sessionCount + 1
    if (createAnother) {
      setSessionCount(newCount)
      setCollectionId(finalCollectionId)
      setCreatingNew(false)
      setNewCollectionName('')
      setCurrentPlace(null)
      setName('')
      setNotes('')
      setInstagramUrl('')
      setCategory('eating')
      setCreatingNewCategory(false)
      setNewCategoryName('')
    } else {
      onDone(newCount)
    }
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
            onClick={handleClose}
            className="rounded-md p-1 text-outline hover:bg-surface-container hover:text-on-surface"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <Field label="Name">
            <NameSearchInput
              name={name}
              onNameChange={setName}
              onPick={applyPicked}
              onEnter={submit}
            />
          </Field>

          {currentPlace?.address && (
            <div className="-mt-2 text-xs text-on-surface-variant">{currentPlace.address}</div>
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
                    onClick={() => {
                      setCreatingNewCategory(false)
                      setCategory(c.id)
                    }}
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
              {customCategories.map((c) => {
                const Icon = CUSTOM_CATEGORY_ICONS[c.icon] ?? CUSTOM_CATEGORY_ICONS.tag
                const active = c.id === category
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCreatingNewCategory(false)
                      setCategory(c.id)
                    }}
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
              {creatingNewCategory ? (
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      const id = actions.createCustomCategory({ label: newCategoryName.trim() })
                      setCategory(id)
                      setCreatingNewCategory(false)
                      setNewCategoryName('')
                    } else if (e.key === 'Escape') {
                      setCreatingNewCategory(false)
                    }
                  }}
                  onBlur={() => {
                    if (!newCategoryName.trim()) setCreatingNewCategory(false)
                  }}
                  placeholder="New category name…"
                  className="w-28 rounded-full border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs outline-none placeholder:text-outline focus:border-primary"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setCreatingNewCategory(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-outline-variant px-2.5 py-1 text-xs font-medium text-on-surface-variant hover:border-outline"
                >
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                  New category
                </button>
              )}
            </div>
          </Field>

          <Field label="City">
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
                    placeholder="New city name…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-outline"
                  />
                ) : (
                  '+ New city…'
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

        <div className="flex items-center justify-between gap-2 border-t border-outline-variant px-5 py-3">
          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant accent-primary"
            />
            Create another
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
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
    </div>
  )
}

/** Name field that doubles as a live Google Places search — same autocomplete
 * behavior as the map's search bar, but controlled so the displayed text can
 * also be edited freely or reset between "Create another" entries. */
function NameSearchInput({
  name,
  onNameChange,
  onPick,
  onEnter,
}: {
  name: string
  onNameChange: (name: string) => void
  onPick: (place: PickedPlace) => void
  onEnter: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const placesLib = useMapsLibrary('places')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!placesLib || !inputRef.current) return
    const autocomplete = new placesLib.Autocomplete(inputRef.current, { fields: AUTOCOMPLETE_FIELDS })
    const listener = autocomplete.addListener('place_changed', () => {
      const picked = placeResultToPicked(autocomplete.getPlace())
      if (picked) onPick(picked)
    })
    setReady(true)
    return () => listener.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib])

  return (
    <div className="relative">
      {ready ? (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline" />
      ) : (
        <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-outline" />
      )}
      <input
        ref={inputRef}
        autoFocus
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter()
        }}
        placeholder="Search for a place, or type a name…"
        className="w-full rounded-lg border border-outline-variant py-2 pl-8 pr-3 text-sm outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
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
