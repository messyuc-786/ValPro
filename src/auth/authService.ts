import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient'
import { normalizeUsername, validateUsername } from './username'

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
  | { ok: false; reason: 'validation'; message: string }
  | { ok: false; reason: 'error'; message: string }

function notConfigured<T>(): AuthResult<T> {
  return { ok: false, reason: 'not_configured' }
}

/**
 * Supabase's own error messages are written for a developer reading logs,
 * not a person filling in a form ("Invalid login credentials", raw
 * Postgres constraint text on a duplicate username, etc.) — never shown to
 * a user directly. Unrecognized messages fall back to one honest, generic
 * sentence rather than leaking implementation detail.
 */
function toHumanMessage(rawMessage: string): string {
  const message = rawMessage.toLowerCase()
  if (message.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (message.includes('user already registered') || message.includes('already registered')) return 'An account with this email already exists.'
  if (message.includes('email') && message.includes('invalid')) return 'Enter a valid email address.'
  if (message.includes('password') && (message.includes('short') || message.includes('weak') || message.includes('least'))) {
    return 'Choose a stronger password (at least 8 characters).'
  }
  if (message.includes('rate limit') || message.includes('too many requests')) return 'Too many attempts. Wait a moment and try again.'
  if (message.includes('fetch') || message.includes('network')) return "Couldn't reach the server. Check your connection and try again."
  if (message.includes('duplicate') && message.includes('username')) return 'That username is already taken.'
  if (message.includes('jwt') || message.includes('session') || message.includes('expired')) return 'Your session has expired. Please sign in again.'
  return "Something went wrong. Please try again."
}

export async function signUp(email: string, password: string, rawUsername: string): Promise<AuthResult<{ user: User | null }>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const usernameCheck = validateUsername(rawUsername)
  if (!usernameCheck.valid) return { ok: false, reason: 'validation', message: usernameCheck.message }
  const username = normalizeUsername(rawUsername)

  const availability = await checkUsernameAvailable(username)
  if (availability.ok && !availability.data.available) {
    return { ok: false, reason: 'validation', message: 'That username is already taken.' }
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })
  if (error) return { ok: false, reason: 'error', message: toHumanMessage(error.message) }
  return { ok: true, data: { user: data.user } }
}

/** Checked client-side before signUp() as a fast-fail UX (e.g. live "is this
 * taken?" feedback while typing) — the database's case-insensitive unique
 * index (see the migration) is still the actual source of truth; this can
 * race under concurrent signups and the DB constraint is what wins that race. */
export async function checkUsernameAvailable(rawUsername: string): Promise<AuthResult<{ available: boolean }>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const usernameCheck = validateUsername(rawUsername)
  if (!usernameCheck.valid) return { ok: false, reason: 'validation', message: usernameCheck.message }
  const username = normalizeUsername(rawUsername)

  const { data, error } = await client.from('profiles').select('id').eq('username', username).maybeSingle()
  if (error) return { ok: false, reason: 'error', message: toHumanMessage(error.message) }
  return { ok: true, data: { available: !data } }
}

export async function signIn(email: string, password: string): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, reason: 'error', message: toHumanMessage(error.message) }
  return { ok: true, data: { user: data.user, session: data.session } }
}

export async function signOut(): Promise<AuthResult> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { error } = await client.auth.signOut()
  if (error) return { ok: false, reason: 'error', message: toHumanMessage(error.message) }
  return { ok: true, data: undefined }
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { error } = await client.auth.resetPasswordForEmail(email)
  if (error) return { ok: false, reason: 'error', message: toHumanMessage(error.message) }
  return { ok: true, data: undefined }
}

export async function getCurrentSession(): Promise<AuthResult<{ session: Session | null }>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { data, error } = await client.auth.getSession()
  if (error) return { ok: false, reason: 'error', message: toHumanMessage(error.message) }
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
