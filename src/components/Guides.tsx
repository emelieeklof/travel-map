import { useState } from 'react'
import { Sparkles, Send, X, Check } from 'lucide-react'
import { actions } from '../store'
import { CATEGORY_BY_ID } from '../categories'
import { ATHENS_GUIDE, type GuideGroup, type GuideSpot } from '../mockGuides'

type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; groups?: GuideGroup[] }

const SUGGESTIONS = ["I'm visiting Athens for 4 days", 'Plan a guide for Athens']

export function Guides() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  // Local, editable copies of the generated groups keyed by message index — this is
  // review-before-save state, not persisted until the user hits Save on a card.
  const [drafts, setDrafts] = useState<Record<number, GuideGroup[]>>({})
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set())

  const send = (text: string) => {
    if (!text.trim() || thinking) return
    const userMsgIndex = messages.length
    setMessages((m) => [...m, { role: 'user', text: text.trim() }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      setMessages((m) => {
        const assistantIndex = m.length
        setDrafts((d) => ({ ...d, [assistantIndex]: structuredClone(ATHENS_GUIDE) }))
        return [
          ...m,
          {
            role: 'assistant',
            text: `Here's a starter guide for Athens — review and edit before saving anything to your collections.`,
            groups: ATHENS_GUIDE,
          },
        ]
      })
      setThinking(false)
    }, 900)
    void userMsgIndex
  }

  const updateGroupName = (msgIndex: number, groupIndex: number, name: string) => {
    setDrafts((d) => {
      const groups = [...d[msgIndex]]
      groups[groupIndex] = { ...groups[groupIndex], name }
      return { ...d, [msgIndex]: groups }
    })
  }

  const removeSpot = (msgIndex: number, groupIndex: number, spotIndex: number) => {
    setDrafts((d) => {
      const groups = [...d[msgIndex]]
      const spots = groups[groupIndex].spots.filter((_, i) => i !== spotIndex)
      groups[groupIndex] = { ...groups[groupIndex], spots }
      return { ...d, [msgIndex]: groups }
    })
  }

  const saveGroup = (group: GuideGroup) => {
    if (group.spots.length === 0) return
    const collectionId = actions.createCollection({ name: group.name })
    group.spots.forEach((spot: GuideSpot) => {
      actions.addPlace({
        collectionId,
        name: spot.name,
        category: spot.category,
        lat: spot.lat,
        lng: spot.lng,
        address: spot.address,
        notes: spot.notes,
        photoUrl: spot.photoUrl,
      })
    })
    setSavedNames((s) => new Set(s).add(group.name))
  }

  return (
    <div className="h-full w-full flex flex-col bg-surface pb-16">
      <div className="px-4 pt-4 pb-3 border-b border-outline-variant/40">
        <h1 className="font-sans text-2xl font-bold text-on-surface">Guides</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">Describe a trip, get a starter guide you can edit and save.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface-variant"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
            {m.role === 'user' ? (
              <div className="max-w-[80%] rounded-2xl bg-primary text-on-primary px-4 py-2 text-sm">{m.text}</div>
            ) : (
              <div className="max-w-full">
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container/20 text-primary shrink-0">
                    <Sparkles size={13} />
                  </span>
                  <div className="rounded-2xl bg-surface-container px-4 py-2 text-sm text-on-surface">{m.text}</div>
                </div>
                {drafts[i] && (
                  <div className="space-y-3 pl-8">
                    {drafts[i].map((group, gi) => (
                      <GuideCard
                        key={gi}
                        group={group}
                        saved={savedNames.has(group.name)}
                        onNameChange={(name) => updateGroupName(i, gi, name)}
                        onRemoveSpot={(si) => removeSpot(i, gi, si)}
                        onSave={() => saveGroup(group)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 text-xs text-outline pl-1">
            <Sparkles size={14} className="animate-pulse" /> Thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 px-4 py-3 border-t border-outline-variant/40"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I'm visiting Athens for 4 days…"
          className="flex-1 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="submit"
          aria-label="Send"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}

function GuideCard({
  group,
  saved,
  onNameChange,
  onRemoveSpot,
  onSave,
}: {
  group: GuideGroup
  saved: boolean
  onNameChange: (name: string) => void
  onRemoveSpot: (spotIndex: number) => void
  onSave: () => void
}) {
  return (
    <div className="rounded-md bg-surface-container-lowest shadow-card border border-outline-variant/40 p-3">
      <input
        value={group.name}
        onChange={(e) => onNameChange(e.target.value)}
        className="w-full bg-transparent font-sans text-sm font-bold text-on-surface outline-none mb-2"
      />
      <ul className="space-y-1.5">
        {group.spots.map((spot, si) => {
          const cat = CATEGORY_BY_ID[spot.category]
          return (
            <li key={si} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-1.5 min-w-0">
                <cat.icon size={12} color={cat.color} strokeWidth={2.5} className="shrink-0" />
                <span className="text-on-surface truncate">{spot.name}</span>
              </div>
              <button onClick={() => onRemoveSpot(si)} aria-label={`Remove ${spot.name}`} className="text-outline shrink-0">
                <X size={14} />
              </button>
            </li>
          )
        })}
        {group.spots.length === 0 && <li className="text-xs text-outline py-1">No spots left — nothing to save.</li>}
      </ul>
      <button
        onClick={onSave}
        disabled={saved || group.spots.length === 0}
        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
          saved
            ? 'bg-secondary-container text-on-secondary-container'
            : 'bg-primary text-on-primary disabled:opacity-50'
        }`}
      >
        {saved ? (
          <>
            <Check size={13} /> Saved
          </>
        ) : (
          'Save to my collections'
        )}
      </button>
    </div>
  )
}
