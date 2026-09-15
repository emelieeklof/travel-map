import { vi } from 'vitest'

/**
 * A minimal chainable mock of the Supabase client's query builder, generic enough
 * to satisfy every `.from(...).insert()/.update()/.delete()/.upsert()/.select()/.eq()/.in()/.single()`
 * combination the store uses. Every step returns the same thenable chain object,
 * which resolves to `{ data: null, error: null }` when awaited — enough fidelity
 * for these tests, which assert on what store actions were *called with*, not on
 * real persisted data.
 */
export function createMockSupabaseClient() {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'order']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }))
  chain.then = (resolve: (v: { data: null; error: null }) => unknown) =>
    resolve({ data: null, error: null })

  return {
    from: vi.fn(() => chain),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(() => Promise.resolve()),
    },
  }
}
