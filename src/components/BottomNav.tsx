import { Home, Compass, Plus, Sparkles, User } from 'lucide-react'
import { useAppState, actions, type Tab } from '../store'

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'guides', label: 'Guides', icon: Sparkles },
  { id: 'profile', label: 'Me', icon: User },
]

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const tab = useAppState((s) => s.tab)
  const detail = useAppState((s) => s.detail)
  if (detail) return null

  const left = TABS.slice(0, 2)
  const right = TABS.slice(2)

  return (
    <nav className="relative z-20 flex items-center justify-between px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 bg-surface/92 backdrop-blur-md border-t border-outline-variant/50">
      <div className="flex flex-1 items-center justify-evenly">
        {left.map((t) => (
          <NavButton key={t.id} tab={t} active={tab === t.id} />
        ))}
      </div>
      <button
        onClick={onAdd}
        aria-label="Add place"
        className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center gap-0.5 px-3 py-1"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-fab -mt-6 ring-4 ring-surface">
          <Plus size={26} strokeWidth={2.5} />
        </span>
        <span className="text-[11px] font-semibold text-primary">Add</span>
      </button>
      <div className="flex flex-1 items-center justify-evenly">
        {right.map((t) => (
          <NavButton key={t.id} tab={t} active={tab === t.id} />
        ))}
      </div>
    </nav>
  )
}

function NavButton({ tab, active }: { tab: { id: Tab; label: string; icon: typeof Home }; active: boolean }) {
  const Icon = tab.icon
  return (
    <button
      onClick={() => actions.goToTab(tab.id)}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-semibold ${
        active ? 'text-primary' : 'text-outline'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      {tab.label}
    </button>
  )
}
