import { useSyncExternalStore } from 'react'

/**
 * A faithful stand-in for the real `useAppState` (`src/store.ts`), built on the
 * same `useSyncExternalStore` primitive. This matters: a naive mock that just
 * calls `selector(state)` directly does NOT reproduce React's snapshot-stability
 * requirement, so it would silently pass tests even when a component's selector
 * allocates a new array/object every render (the exact bug that caused the
 * "blank page on Add" regression — see AddPlaceDialog.test.tsx). Using the real
 * primitive here means that class of bug actually fails the test, for real.
 */
export function createMockUseAppState<S extends object>(state: S) {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((l) => l())
  const subscribe = (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  }
  const useAppState = <T,>(selector: (s: S) => T): T =>
    useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
  return { useAppState, notify }
}
