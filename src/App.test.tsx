import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import App from './App'
import { createMockUseAppState } from './test/mockUseAppState'

const state = { authStatus: 'loading' as 'loading' | 'signedOut' | 'signedIn' }
const { useAppState } = createMockUseAppState(state)

vi.mock('./store', () => ({
  useAppState: (selector: (s: typeof state) => unknown) => useAppState(selector),
  hydrate: vi.fn(),
  markSignedOut: vi.fn(),
  actions: {},
}))

vi.mock('./lib/supabase', () => ({
  supabaseConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('App — auth gate', () => {
  it('shows only the splash screen while authStatus is "loading"', () => {
    state.authStatus = 'loading'
    render(<App />)
    expect(screen.getByTestId('app-splash')).toBeInTheDocument()
    expect(screen.queryByTestId('app-content')).not.toBeInTheDocument()
  })

  it('keeps the splash screen fully opaque for a minimum time, even once signed out resolves', () => {
    state.authStatus = 'signedOut'
    render(<App />)
    // The sign-in screen mounts underneath right away (so it's ready to cross-fade in),
    // but the splash layer must stay fully opaque until the minimum time elapses.
    expect(screen.getByTestId('app-splash')).not.toHaveClass('opacity-0')
    expect(screen.getByTestId('app-content')).toHaveClass('opacity-0')
  })

  it('cross-fades to the sign-in screen once the minimum splash time has passed', () => {
    state.authStatus = 'signedOut'
    render(<App />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('app-content')).not.toHaveClass('opacity-0')
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })
})
