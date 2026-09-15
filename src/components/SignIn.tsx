import { supabase, supabaseConfigured } from '../lib/supabase'
import { Logo } from './Logo'

export function SignIn() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-surface px-8 text-center">
      <Logo size={56} />
      <div>
        <h1 className="font-serif text-2xl font-semibold text-on-surface">SPOTTED</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Curated maps & creators</p>
      </div>

      {supabaseConfigured ? (
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-fab"
        >
          Continue with Google
        </button>
      ) : (
        <div className="max-w-xs rounded-md border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
          Supabase isn't configured yet — add <code className="rounded bg-surface-container px-1 py-0.5 text-xs">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-surface-container px-1 py-0.5 text-xs">VITE_SUPABASE_ANON_KEY</code> to <code className="rounded bg-surface-container px-1 py-0.5 text-xs">.env.local</code>.
        </div>
      )}
    </div>
  )
}
