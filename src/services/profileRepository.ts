import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient'
import type { Profile } from '../types/profile'
import type { ValuationResult } from '../types/valuation'

/**
 * The one boundary through which any screen/component reaches cloud
 * storage — no screen imports the Supabase client or writes a query
 * directly. Every function is guarded by isSupabaseConfigured and never
 * throws a raw Supabase/Postgres error outward; callers get a typed result.
 *
 * `userId` always comes from the authenticated session (see
 * AppContext's `session.user.id`), never from anything user-suppliable —
 * Row Level Security enforces this server-side too (auth.uid() = id/user_id
 * in every policy in supabase/migrations/0001_init.sql), so even a client
 * bug passing the wrong id here cannot read or write another user's row.
 */
export type RepoResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; reason: 'not_configured' }
  | { ok: false; reason: 'error'; message: string }

function notConfigured<T>(): RepoResult<T> {
  return { ok: false, reason: 'not_configured' }
}

function toHumanMessage(): string {
  return "Couldn't sync your data right now. It's still saved on this device."
}

interface CloudProfileRow {
  id: string
  username: string
  display_name: string | null
  profile_data: Profile | null
  updated_at: string
}

/** Loads the signed-in user's cloud profile row, or null if they have none
 * yet (e.g. signed up but never saved a ValPro profile from this device). */
export async function loadCloudProfile(userId: string): Promise<RepoResult<CloudProfileRow | null>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { data, error } = await client.from('profiles').select('id, username, display_name, profile_data, updated_at').eq('id', userId).maybeSingle()
  if (error) return { ok: false, reason: 'error', message: toHumanMessage() }
  return { ok: true, data: data as CloudProfileRow | null }
}

/** Upserts the ValPro profile onto the user's existing `profiles` row
 * (created by the signup trigger — see the migration's handle_new_user()).
 * Never creates the row itself: a profile row without an authenticated
 * signup should not be able to exist, by construction. */
export async function saveCloudProfile(userId: string, profile: Profile): Promise<RepoResult> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { error } = await client.from('profiles').update({ profile_data: profile }).eq('id', userId)
  if (error) return { ok: false, reason: 'error', message: toHumanMessage() }
  return { ok: true, data: undefined }
}

interface SavedValuationRow {
  id: string
  domain_id: string
  market_evidence: string
  market_value_lpa: number | null
  score: number | null
  confidence: string | null
  raw_result: ValuationResult
  created_at: string
}

export async function loadSavedValuations(userId: string): Promise<RepoResult<SavedValuationRow[]>> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  const { data, error } = await client
    .from('valuation_history')
    .select('id, domain_id, market_evidence, market_value_lpa, score, confidence, raw_result, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return { ok: false, reason: 'error', message: toHumanMessage() }
  return { ok: true, data: (data ?? []) as SavedValuationRow[] }
}

export async function saveValuation(userId: string, result: ValuationResult): Promise<RepoResult> {
  const client = getSupabaseClient()
  if (!client) return notConfigured()

  // One consistent object shape (fields nullable rather than a union of two
  // narrower shapes) — Supabase's untyped client (no generated Database
  // type; there's no live project to generate one from) infers .insert()'s
  // parameter from whatever's passed, and a union confuses that inference.
  const isInsufficient = result.marketEvidence === 'insufficient'
  const row: {
    user_id: string
    domain_id: string
    market_evidence: string
    market_value_lpa: number | null
    score: number | null
    confidence: string | null
    raw_result: ValuationResult
  } = {
    user_id: userId,
    domain_id: result.domainId,
    market_evidence: result.marketEvidence,
    market_value_lpa: isInsufficient ? null : result.marketValueLPA,
    score: isInsufficient ? null : result.score,
    confidence: isInsufficient ? null : result.confidence,
    raw_result: result,
  }

  const { error } = await client.from('valuation_history').insert(row)
  if (error) return { ok: false, reason: 'error', message: toHumanMessage() }
  return { ok: true, data: undefined }
}

/**
 * Local-first → cloud transition: called once, right after a successful
 * sign-in, only when the user's cloud profile has no ValPro data yet. Never
 * overwrites a cloud profile that already has data with a possibly-older
 * local one — the cloud copy wins once it exists, by design, rather than a
 * merge that could silently drop fields either side entered.
 *
 * Deterministic: given the same (userId, localProfile, existing cloud
 * state), the outcome is always the same — no randomness, no partial writes
 * (a single update call, RLS-scoped to this user's row only).
 */
export async function migrateLocalProfileToCloud(userId: string, localProfile: Profile): Promise<RepoResult<'migrated' | 'skipped_has_cloud_data' | 'skipped_empty_local'>> {
  if (!isSupabaseConfigured) return notConfigured()

  const hasMeaningfulLocalData =
    Boolean(localProfile.role) ||
    Boolean(localProfile.domain) ||
    Boolean(localProfile.education.institute) ||
    localProfile.skills.length > 0
  if (!hasMeaningfulLocalData) return { ok: true, data: 'skipped_empty_local' }

  const existing = await loadCloudProfile(userId)
  if (!existing.ok) return existing
  if (existing.data?.profile_data) return { ok: true, data: 'skipped_has_cloud_data' }

  const saved = await saveCloudProfile(userId, localProfile)
  if (!saved.ok) return saved
  return { ok: true, data: 'migrated' }
}
