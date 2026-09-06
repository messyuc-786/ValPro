import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * MOCKED INTEGRATION TESTS — not a real Supabase verification.
 *
 * No Supabase project exists (see docs/VALPRO_AUTH_ARCHITECTURE.md /
 * VALPRO_PHASE_4_REPORT.md), so these tests replace the Supabase client
 * entirely with hand-written fakes and assert that authService.ts calls the
 * right client methods with the right arguments and maps their results
 * correctly. They prove authService's *logic* is correct; they cannot and
 * do not prove anything about a real Supabase project, real network
 * behavior, or real Postgres/RLS enforcement — see
 * `src/domains/../../supabase/migrations/0001_init.sql`'s own tests
 * (there are none — static review only, documented in the Phase 4 report)
 * for that boundary.
 */

const mockAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}
const mockFrom = vi.fn()
const mockClient = { auth: mockAuth, from: mockFrom }

vi.mock('../lib/supabaseClient', () => ({
  isSupabaseConfigured: true,
  getSupabaseClient: () => mockClient,
}))

const {
  signUp,
  signIn,
  signOut,
  requestPasswordReset,
  getCurrentSession,
  onAuthStateChange,
  checkUsernameAvailable,
} = await import('./authService')

function usernameQueryBuilder(result: { data: unknown; error: unknown }) {
  return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve(result) }) }) }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signUp — success and validation', () => {
  it('rejects an invalid username before ever calling Supabase', async () => {
    const result = await signUp('a@b.com', 'password123', 'no')
    expect(result).toEqual({ ok: false, reason: 'validation', message: 'Username must be at least 3 characters.' })
    expect(mockAuth.signUp).not.toHaveBeenCalled()
  })

  it('rejects an already-taken username before calling auth.signUp', async () => {
    mockFrom.mockReturnValue(usernameQueryBuilder({ data: { id: 'existing-user' }, error: null }))
    const result = await signUp('a@b.com', 'password123', 'taken')
    expect(result).toEqual({ ok: false, reason: 'validation', message: 'That username is already taken.' })
    expect(mockAuth.signUp).not.toHaveBeenCalled()
  })

  it('normalizes the username and calls auth.signUp on success', async () => {
    mockFrom.mockReturnValue(usernameQueryBuilder({ data: null, error: null }))
    mockAuth.signUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

    const result = await signUp('a@b.com', 'password123', 'NewUser')

    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
      options: { data: { username: 'newuser' } },
    })
    expect(result).toEqual({ ok: true, data: { user: { id: 'u1' } } })
  })

  it('maps a raw "User already registered" Supabase error to a human message', async () => {
    mockFrom.mockReturnValue(usernameQueryBuilder({ data: null, error: null }))
    mockAuth.signUp.mockResolvedValue({ data: { user: null }, error: { message: 'User already registered' } })

    const result = await signUp('a@b.com', 'password123', 'someone')
    expect(result).toEqual({ ok: false, reason: 'error', message: 'An account with this email already exists.' })
  })
})

describe('checkUsernameAvailable', () => {
  it('reports available when no row is found', async () => {
    mockFrom.mockReturnValue(usernameQueryBuilder({ data: null, error: null }))
    expect(await checkUsernameAvailable('freeusername')).toEqual({ ok: true, data: { available: true } })
  })

  it('reports unavailable when a row already exists', async () => {
    mockFrom.mockReturnValue(usernameQueryBuilder({ data: { id: 'x' }, error: null }))
    expect(await checkUsernameAvailable('takenname')).toEqual({ ok: true, data: { available: false } })
  })
})

describe('signIn — success and failure', () => {
  it('returns the session on success', async () => {
    const session = { access_token: 't' }
    mockAuth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' }, session }, error: null })

    const result = await signIn('a@b.com', 'correct-password')
    expect(result).toEqual({ ok: true, data: { user: { id: 'u1' }, session } })
  })

  it('maps invalid credentials to a human-readable message, not the raw Supabase text', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } })

    const result = await signIn('a@b.com', 'wrong-password')
    expect(result).toEqual({ ok: false, reason: 'error', message: 'Incorrect email or password.' })
  })

  it('maps a network failure to a human-readable message', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Failed to fetch' } })

    const result = await signIn('a@b.com', 'password123')
    expect(result.ok).toBe(false)
    if (!result.ok && result.reason === 'error') {
      expect(result.message).toMatch(/connection/i)
    }
  })
})

describe('signOut', () => {
  it('succeeds when Supabase reports no error', async () => {
    mockAuth.signOut.mockResolvedValue({ error: null })
    expect(await signOut()).toEqual({ ok: true, data: undefined })
  })
})

describe('requestPasswordReset', () => {
  it('succeeds regardless of whether the email exists (Supabase itself does not leak that)', async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null })
    expect(await requestPasswordReset('anyone@example.com')).toEqual({ ok: true, data: undefined })
  })
})

describe('getCurrentSession — session restoration', () => {
  it('returns the restored session on page load', async () => {
    const session = { access_token: 'restored' }
    mockAuth.getSession.mockResolvedValue({ data: { session }, error: null })
    expect(await getCurrentSession()).toEqual({ ok: true, data: { session } })
  })

  it('returns null session when signed out', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    expect(await getCurrentSession()).toEqual({ ok: true, data: { session: null } })
  })

  it('maps an expired-session error to a human-readable message', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: { message: 'JWT expired' } })
    const result = await getCurrentSession()
    expect(result).toEqual({ ok: false, reason: 'error', message: 'Your session has expired. Please sign in again.' })
  })
})

describe('onAuthStateChange', () => {
  it('subscribes through the client and forwards the session to the callback', () => {
    const unsubscribe = vi.fn()
    let capturedCallback: ((event: string, session: unknown) => void) | undefined
    mockAuth.onAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe } } }
    })

    const callback = vi.fn()
    const unsubscribeFn = onAuthStateChange(callback)

    capturedCallback?.('SIGNED_IN', { access_token: 'x' })
    expect(callback).toHaveBeenCalledWith({ access_token: 'x' })

    unsubscribeFn()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
