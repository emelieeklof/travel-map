import { useEffect, useState } from 'react'
import { PartyPopper } from 'lucide-react'

/** Small celebratory toast shown after a "Create another" streak of 2+ pins.
 * Auto-dismisses via onDone after ~2s. */
export function PinsCreatedToast({ count, onDone }: { count: number; onDone: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10)
    const hideTimer = setTimeout(() => setVisible(false), 1700)
    const doneTimer = setTimeout(onDone, 2000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center">
      <div
        className={
          'pointer-events-auto flex items-center gap-2.5 rounded-full bg-primary px-5 py-3 text-on-primary shadow-float transition-all duration-300 ' +
          (visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0')
        }
      >
        <PartyPopper className="h-5 w-5" />
        <span className="text-sm font-semibold">
          Successfully created {count} pin{count === 1 ? '' : 's'}!
        </span>
      </div>
    </div>
  )
}
