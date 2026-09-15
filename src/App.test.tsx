import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('App — auth gate', () => {
  it('shows a blank loading state while authStatus is "loading"', () => {
    state.authStatus = 'loading'
    const { container } = render(<App />)
    expect(container.querySelector('.bg-surface')).toBeInTheDocument()
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument()
  })

  it('shows the sign-in screen when authStatus is "signedOut"', () => {
    state.authStatus = 'signedOut'
    render(<App />)
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })
})
