import { describe, expect, it, vi } from 'vitest'

// Forces the "no Supabase project configured" baseline deterministically,
// regardless of whatever real .env.local exists on the machine running the
// tests (e.g. once a developer connects a real project for manual testing —
// see docs/VALPRO_SUPABASE_SETUP.md). This suite specifically pins down the
// not-configured degradation path; src/auth/authService.mocked.test.ts
// covers the configured/mocked-Supabase behavior instead.
vi.mock('../lib/supabaseClient', () => ({
  isSupabaseConfigured: false,
  getSupabaseClient: () => null,
}))

const { getCurrentSession, isSupabaseConfigured, onAuthStateChange, requestPasswordReset, signIn, signOut, signUp } = await import('./authService')

/**
 * No live Supabase project is configured in this test environment — this
 * suite verifies that every auth operation degrades to a clear, typed
 * "not configured" result instead of throwing or silently doing nothing.
 * The live sign-up/login/session round-trip against a real project cannot
 * be verified here — see docs/VALPRO_AUTH_ARCHITECTURE.md.
 */
describe('authService — graceful behavior with no Supabase project configured', () => {
  it('reports isSupabaseConfigured as false', () => {
    expect(isSupabaseConfigured).toBe(false)
  })

  it('signUp returns a not_configured result rather than throwing', async () => {
    const result = await signUp('test@example.com', 'password123', 'testuser')
    expect(result).toEqual({ ok: false, reason: 'not_configured' })
  })

  it('signIn returns a not_configured result rather than throwing', async () => {
    const result = await signIn('test@example.com', 'password123')
    expect(result).toEqual({ ok: false, reason: 'not_configured' })
  })

  it('signOut returns a not_configured result rather than throwing', async () => {
    const result = await signOut()
    expect(result).toEqual({ ok: false, reason: 'not_configured' })
  })

  it('requestPasswordReset returns a not_configured result rather than throwing', async () => {
    const result = await requestPasswordReset('test@example.com')
    expect(result).toEqual({ ok: false, reason: 'not_configured' })
  })

  it('getCurrentSession returns a not_configured result rather than throwing', async () => {
    const result = await getCurrentSession()
    expect(result).toEqual({ ok: false, reason: 'not_configured' })
  })

  it('onAuthStateChange returns a safe no-op unsubscribe instead of throwing', () => {
    const unsubscribe = onAuthStateChange(() => {})
    expect(() => unsubscribe()).not.toThrow()
  })
})
