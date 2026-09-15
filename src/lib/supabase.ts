import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

// Supabase's client throws synchronously if given an empty/invalid URL, so fall back to a
// harmless placeholder when not configured yet — network calls will fail gracefully later
// instead of crashing the whole app at import time.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key')
