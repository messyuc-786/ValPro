import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Lazily-created Supabase client, gated on real credentials being present.
 * No project exists yet as of this writing — see .env.example and
 * docs/VALPRO_AUTH_ARCHITECTURE.md. Every piece of code that touches this
 * MUST check `isSupabaseConfigured` first; nothing here throws if the env
 * vars are unset, so the app keeps working exactly as it does today
 * (local-only, no auth) until a real project is connected.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null

/** Returns the Supabase client, or null if not configured. Never throws. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!client) {
    // Safe: isSupabaseConfigured (checked above) guarantees both are non-empty strings here.
    client = createClient(url!, anonKey!)
  }
  return client
}
