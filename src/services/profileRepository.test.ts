import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyProfile } from '../types/profile'

/**
 * MOCKED INTEGRATION TESTS — see the header comment in
 * src/auth/authService.mocked.test.ts for what this label does and doesn't
 * mean. No real Supabase project or Postgres/RLS enforcement is exercised
 * here; this proves profileRepository's own logic (what it calls, with
 * what arguments, how it interprets the result) is correct.
 */

const mockFrom = vi.fn()
const mockClient = { from: mockFrom }

vi.mock('../lib/supabaseClient', () => ({
  isSupabaseConfigured: true,
  getSupabaseClient: () => mockClient,
}))

const { loadCloudProfile, saveCloudProfile, loadSavedValuations, saveValuation, migrateLocalProfileToCloud } = await import('./profileRepository')

beforeEach(() => {
  vi.clearAllMocks()
})

function selectEqMaybeSingle(result: { data: unknown; error: unknown }) {
  return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve(result) }) }) }
}

describe('loadCloudProfile', () => {
  it('returns null when the user has no saved cloud profile yet', async () => {
    mockFrom.mockReturnValue(selectEqMaybeSingle({ data: null, error: null }))
    expect(await loadCloudProfile('user-1')).toEqual({ ok: true, data: null })
  })

  it('returns the row when one exists', async () => {
    const row = { id: 'user-1', username: 'alice', display_name: null, profile_data: createEmptyProfile(), updated_at: '2026-01-01' }
    mockFrom.mockReturnValue(selectEqMaybeSingle({ data: row, error: null }))
    expect(await loadCloudProfile('user-1')).toEqual({ ok: true, data: row })
  })

  it('never leaks a raw database error message to the caller', async () => {
    mockFrom.mockReturnValue(selectEqMaybeSingle({ data: null, error: { message: 'relation "profiles" does not exist' } }))
    const result = await loadCloudProfile('user-1')
    expect(result.ok).toBe(false)
    if (!result.ok && result.reason === 'error') {
      expect(result.message).not.toContain('relation')
    }
  })
})

describe('saveCloudProfile', () => {
  it('updates the existing profile row scoped to the given user id, and only that id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update })

    const profile = createEmptyProfile()
    const result = await saveCloudProfile('user-1', profile)

    expect(update).toHaveBeenCalledWith({ profile_data: profile })
    expect(eq).toHaveBeenCalledWith('id', 'user-1')
    expect(result).toEqual({ ok: true, data: undefined })
  })
})

describe('saveValuation', () => {
  it('inserts a row scoped to the given user id for a demo/partial (evaluated) result', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert })

    const result: import('../types/valuation').ValuationResult = {
      domainId: 'technology',
      asOf: '2026-01-01',
      marketEvidence: 'partial',
      marketValueLPA: 12.5,
      lowerRangeLPA: 10,
      upperRangeLPA: 15,
      potentialValueLPA: 14,
      score: 60,
      percentileTopPercent: 40,
      confidence: 'High',
      positiveSignals: [],
      improvementSignals: [],
      valueGaps: [],
      scenarios: [],
      nextMoves: [],
    }

    await saveValuation('user-1', result)
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', domain_id: 'technology', market_evidence: 'partial', market_value_lpa: 12.5 }),
    )
  })

  it('inserts a row with null numeric fields for an insufficient-evidence result', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert })

    const result: import('../types/valuation').ValuationResult = {
      domainId: 'legal',
      asOf: '2026-01-01',
      marketEvidence: 'insufficient',
      reason: 'no data',
      missingEvidence: [],
      suggestedAction: 'try another domain',
      profileCompletenessRatio: 0.5,
    }

    await saveValuation('user-1', result)
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', domain_id: 'legal', market_evidence: 'insufficient', market_value_lpa: null, score: null, confidence: null }),
    )
  })
})

describe('loadSavedValuations', () => {
  it('orders by most recent first and scopes to the given user id', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ select })

    await loadSavedValuations('user-1')
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })
})

describe('migrateLocalProfileToCloud — deterministic local-first -> cloud transition', () => {
  it('skips migration for a genuinely empty local profile', async () => {
    const result = await migrateLocalProfileToCloud('user-1', createEmptyProfile())
    expect(result).toEqual({ ok: true, data: 'skipped_empty_local' })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('skips migration when the cloud profile already has data, never overwriting it', async () => {
    mockFrom.mockReturnValue(selectEqMaybeSingle({ data: { profile_data: { role: 'fresher' } }, error: null }))
    const local = { ...createEmptyProfile(), role: 'working_professional' as const }

    const result = await migrateLocalProfileToCloud('user-1', local)
    expect(result).toEqual({ ok: true, data: 'skipped_has_cloud_data' })
  })

  it('migrates a meaningful local profile when the cloud profile has none yet', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount += 1
      // First call: loadCloudProfile's select().eq().maybeSingle() chain.
      // Second call: saveCloudProfile's update().eq() chain.
      return callCount === 1 ? selectEqMaybeSingle({ data: { profile_data: null }, error: null }) : { update }
    })

    const local = { ...createEmptyProfile(), role: 'fresher' as const, domain: 'technology' as const }
    const result = await migrateLocalProfileToCloud('user-1', local)

    expect(result).toEqual({ ok: true, data: 'migrated' })
    expect(update).toHaveBeenCalledWith({ profile_data: local })
  })

  it('is deterministic — the same inputs always produce the same outcome', async () => {
    mockFrom.mockReturnValue(selectEqMaybeSingle({ data: null, error: null }))
    const local = createEmptyProfile() // empty -> always skipped, regardless of cloud state
    const a = await migrateLocalProfileToCloud('user-1', local)
    const b = await migrateLocalProfileToCloud('user-1', local)
    expect(a).toEqual(b)
  })
})
