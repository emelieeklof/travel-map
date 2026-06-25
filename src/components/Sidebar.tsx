import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Map as MapIcon,
  Share2,
  Globe2,
  Footprints,
  Check,
  X as XIcon,
} from 'lucide-react'
import { actions, useAppState } from '../store'
import { CATEGORIES, CATEGORY_BY_ID, type CategoryId } from '../categories'
import type { List, Place } from '../types'

type SidebarProps = {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const lists = useAppState((s) => s.lists)
  const activeList = useAppState((s) =>
    s.lists.find((l) => l.id === s.activeListId) ?? null,
  )
  const places = useAppState((s) => s.places)
  const hidden = useAppState((s) => s.hiddenCategories)
  const selectedId = useAppState((s) => s.selectedPlaceId)
  const compareSelection = useAppState((s) => s.compareSelection)

  // When the user finishes picking both compare places on mobile, slide the
  // drawer out so they can see the route they just created.
  useEffect(() => {
    if (compareSelection?.length === 2) onClose?.()
  }, [compareSelection?.length, onClose])

  const placesInList = useMemo(
    () => (activeList ? places.filter((p) => p.listId === activeList.id) : []),
    [places, activeList],
  )

  const visiblePlaces = useMemo(
    () => placesInList.filter((p) => !hidden.includes(p.category)),
    [placesInList, hidden],
  )

  const countsByCategory = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      eating: 0,
      sightseeing: 0,
      shopping: 0,
      bars: 0,
      activities: 0,
      other: 0,
    }
    placesInList.forEach((p) => {
      counts[p.category] += 1
    })
    return counts
  }, [placesInList])

  return (
    <aside
      className={
        'flex h-full flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ' +
        'fixed inset-y-0 left-0 z-30 w-[88vw] max-w-[340px] ' +
        'md:relative md:z-auto md:w-[340px] md:max-w-none md:translate-x-0 md:border-r md:border-zinc-200 md:shadow-none ' +
        (open ? 'translate-x-0' : '-translate-x-full md:translate-x-0')
      }
    >
      <Header onClose={onClose} />
      <ListSwitcher lists={lists} activeList={activeList} />
      {activeList && (
        <>
          <CategoryFilters counts={countsByCategory} hidden={hidden} />
          <CompareBar
            selection={compareSelection}
            placesInList={placesInList}
          />
          <PlaceList
            places={visiblePlaces}
            selectedId={selectedId}
            compareSelection={compareSelection}
          />
        </>
      )}
      {!activeList && <EmptyState />}
    </aside>
  )
}

function Header({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white">
        <Globe2 className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-zinc-900">Atlas</h1>
        <p className="text-[11px] text-zinc-500">Your travel map</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 md:hidden"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function ListSwitcher({ lists, activeList }: { lists: List[]; activeList: List | null }) {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const placesCount = useAppState(
    (s) => s.places.filter((p) => p.listId === activeList?.id).length,
  )

  const handleNewList = () => {
    const name = prompt('New list name (e.g. "Tokyo", "Roadtrip Italy")')
    if (!name?.trim()) return
    const description = prompt('Short description (optional)') ?? undefined
    actions.createList({ name: name.trim(), description: description?.trim() || undefined })
    setOpen(false)
  }

  const handleRename = () => {
    if (!activeList) return
    const name = prompt('Rename list', activeList.name)
    if (!name?.trim()) return
    actions.renameList(activeList.id, name.trim())
    setMenuOpen(false)
  }

  const handleDelete = () => {
    if (!activeList) return
    if (confirm(`Delete "${activeList.name}" and all its places?`)) {
      actions.deleteList(activeList.id)
    }
    setMenuOpen(false)
  }

  return (
    <div className="relative border-b border-zinc-200 px-3 py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <MapIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Current list
            </span>
          </div>
          <div className="mt-0.5 truncate text-base font-semibold text-zinc-900">
            {activeList?.name ?? 'No list selected'}
          </div>
          {activeList && (
            <div className="truncate text-xs text-zinc-500">
              {placesCount} {placesCount === 1 ? 'place' : 'places'}
              {activeList.description ? ` · ${activeList.description}` : ''}
            </div>
          )}
        </div>
        <ChevronDown
          className={'h-4 w-4 shrink-0 text-zinc-400 transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {activeList && (
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="absolute right-3 top-3 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="List options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}

      {menuOpen && (
        <div className="absolute right-3 top-12 z-20 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          <MenuItem icon={Edit2} label="Rename" onClick={handleRename} />
          <MenuItem
            icon={Share2}
            label="Share (soon)"
            onClick={() => alert('Sharing is on the roadmap — curated lists you can send to friends.')}
          />
          <div className="my-1 h-px bg-zinc-100" />
          <MenuItem icon={Trash2} label="Delete list" onClick={handleDelete} danger />
        </div>
      )}

      {open && (
        <div className="absolute inset-x-3 top-full z-10 mt-1 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          <div className="max-h-60 overflow-y-auto py-1">
            {lists.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  actions.setActiveList(l.id)
                  setOpen(false)
                }}
                className={
                  'flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-zinc-50 ' +
                  (l.id === activeList?.id ? 'bg-zinc-50 font-medium text-zinc-900' : 'text-zinc-700')
                }
              >
                <span className="truncate">{l.name}</span>
                {l.id === activeList?.id && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-zinc-400">Active</span>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-zinc-100">
            <button
              onClick={handleNewList}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4" />
              New list…
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Edit2
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={
        'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-zinc-50 ' +
        (danger ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700')
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function CategoryFilters({
  counts,
  hidden,
}: {
  counts: Record<CategoryId, number>
  hidden: CategoryId[]
}) {
  const hiddenSet = new Set(hidden)
  return (
    <div className="border-b border-zinc-200 px-3 py-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Categories
        </span>
        {hidden.length > 0 && (
          <button
            onClick={() => actions.showAllCategories()}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
          >
            Show all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const isOff = hiddenSet.has(c.id)
          const count = counts[c.id]
          return (
            <button
              key={c.id}
              onClick={() => actions.toggleCategory(c.id)}
              className={
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ' +
                (isOff
                  ? 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50'
                  : 'border-transparent text-white shadow-sm')
              }
              style={isOff ? undefined : { backgroundColor: c.color }}
            >
              <Icon className="h-3 w-3" strokeWidth={2.5} />
              <span>{c.label}</span>
              <span
                className={
                  'ml-0.5 rounded-full px-1.5 py-px text-[10px] tabular-nums ' +
                  (isOff ? 'bg-zinc-100 text-zinc-500' : 'bg-white/25')
                }
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CompareBar({
  selection,
  placesInList,
}: {
  selection: string[] | null
  placesInList: Place[]
}) {
  if (selection === null) {
    if (placesInList.length < 2) return null
    return (
      <div className="border-b border-zinc-200 px-3 py-2">
        <button
          onClick={() => actions.enterCompareMode()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Footprints className="h-3.5 w-3.5" />
          Compare walking distance
        </button>
      </div>
    )
  }
  return (
    <div className="border-b border-zinc-200 bg-indigo-50/60 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-900">
          <Footprints className="h-3.5 w-3.5" />
          {selection.length === 0 && 'Pick two places to compare'}
          {selection.length === 1 && 'Pick one more place'}
          {selection.length === 2 && 'Showing walking route ↓'}
        </div>
        <button
          onClick={() => actions.exitCompareMode()}
          aria-label="Exit compare mode"
          className="rounded-md p-1 text-indigo-700 hover:bg-indigo-100"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function PlaceList({
  places,
  selectedId,
  compareSelection,
}: {
  places: Place[]
  selectedId: string | null
  compareSelection: string[] | null
}) {
  if (places.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
        <div>
          <p className="text-sm font-medium text-zinc-700">No places to show</p>
          <p className="mt-1 text-xs text-zinc-500">
            Search a place above, or toggle category filters back on.
          </p>
        </div>
      </div>
    )
  }
  // Group by category for scannability
  const groups: Record<CategoryId, Place[]> = {
    eating: [], sightseeing: [], shopping: [], bars: [], activities: [], other: [],
  }
  places.forEach((p) => groups[p.category].push(p))

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
      {CATEGORIES.map((c) => {
        const items = groups[c.id]
        if (items.length === 0) return null
        const Icon = c.icon
        return (
          <div key={c.id} className="mt-3 first:mt-0">
            <div className="mb-1 flex items-center gap-1.5 px-2">
              <Icon className="h-3 w-3" style={{ color: c.color }} strokeWidth={2.5} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {c.label}
              </span>
              <span className="text-[10px] text-zinc-400">· {items.length}</span>
            </div>
            <ul>
              {items.map((p) => (
                <PlaceRow
                  key={p.id}
                  place={p}
                  selected={p.id === selectedId}
                  compareSelection={compareSelection}
                />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function PlaceRow({
  place,
  selected,
  compareSelection,
}: {
  place: Place
  selected: boolean
  compareSelection: string[] | null
}) {
  const category = CATEGORY_BY_ID[place.category]
  const compareMode = compareSelection !== null
  const isPicked = compareMode && compareSelection!.includes(place.id)
  return (
    <li>
      <button
        onClick={() => {
          if (compareMode) {
            actions.toggleCompareSelection(place.id)
          } else {
            actions.selectPlace(place.id)
          }
        }}
        className={
          'group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ' +
          (isPicked
            ? 'bg-indigo-50 ring-1 ring-indigo-200'
            : selected && !compareMode
              ? 'bg-zinc-100'
              : 'hover:bg-zinc-50')
        }
      >
        {compareMode ? (
          <span
            className={
              'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ' +
              (isPicked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300 bg-white')
            }
          >
            {isPicked && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
          </span>
        ) : (
          <span
            className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-zinc-900">{place.name}</div>
          {place.address && (
            <div className="truncate text-xs text-zinc-500">{place.address}</div>
          )}
          {place.notes && !place.address && (
            <div className="truncate text-xs text-zinc-500">{place.notes}</div>
          )}
        </div>
      </button>
    </li>
  )
}

function EmptyState() {
  const handleNewList = () => {
    const name = prompt('Name your first list (e.g. "Lisbon")')
    if (!name?.trim()) return
    actions.createList({ name: name.trim() })
  }
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
      <div>
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <MapIcon className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-zinc-900">No lists yet</p>
        <p className="mt-1 text-xs text-zinc-500">
          Create a list for your next destination and start saving places.
        </p>
        <button
          onClick={handleNewList}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          New list
        </button>
      </div>
    </div>
  )
}
