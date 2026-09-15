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
  it('shows the splash screen while authStatus is "loading"', () => {
    state.authStatus = 'loading'
    render(<App />)
    expect(screen.getByText('SPOTTED')).toBeInTheDocument()
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument()
  })

  it('keeps showing the splash screen for a minimum time, even once signed out resolves', () => {
    state.authStatus = 'signedOut'
    render(<App />)
    expect(screen.getByText('SPOTTED')).toBeInTheDocument()
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument()
  })

  it('shows the sign-in screen once authStatus is "signedOut" and the minimum splash time has passed', () => {
    state.authStatus = 'signedOut'
    render(<App />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })
})
