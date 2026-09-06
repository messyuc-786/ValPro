import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient'

/**
 * Auth service abstraction — every screen/component talks to this, never to
 * the Supabase client directly. That's what lets the whole app render a
 * graceful "sign-in isn't available yet" state instead of crashing when no
 * project is configured (which is the case right now — see
 * docs/VALPRO_AUTH_ARCHITECTURE.md), and it's a single seam to swap the
 * backend later without touching any screen.
 */
export type AuthResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; reason: 'not_configured' }
  | { ok: false; reason: 'error'; message: string }

function notConfigured<T>(): AuthResult<T> {
  return { ok: false, reason: 'not_configured' }
}

export async function signUp(email: string, password: string, username: string): Promise<AuthResult<{ user: User | null }>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })
  if (error) return { ok: false, reason: 'error', message: error.message }
  return { ok: true, data: { user: data.user } }
}

export async function signIn(email: string, password: string): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, reason: 'error', message: error.message }
  return { ok: true, data: { user: data.user, session: data.session } }
}

export async function signOut(): Promise<AuthResult> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { error } = await client.auth.signOut()
  if (error) return { ok: false, reason: 'error', message: error.message }
  return { ok: true, data: undefined }
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { error } = await client.auth.resetPasswordForEmail(email)
  if (error) return { ok: false, reason: 'error', message: error.message }
  return { ok: true, data: undefined }
}

export async function getCurrentSession(): Promise<AuthResult<{ session: Session | null }>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { data, error } = await client.auth.getSession()
  if (error) return { ok: false, reason: 'error', message: error.message }
  return { ok: true, data: { session: data.session } }
}

/** Subscribes to auth state changes. Returns a no-op unsubscribe when auth
 * isn't configured, so callers never need to branch on isSupabaseConfigured
 * themselves just to attach a listener safely. */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const client = getSupabaseClient()
  if (!client) return () => {}

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => callback(session))
  return () => subscription.unsubscribe()
}

export { isSupabaseConfigured }
