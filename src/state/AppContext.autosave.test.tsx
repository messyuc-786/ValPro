import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Covers the one genuinely new piece of behavior added to AppContext this
 * sprint: auto-saving a computed result to valuation_history the moment a
 * signed-in user reaches the Result screen — this is what gives the
 * Account screen's "My Valuations" list anything to show at all, since
 * nothing else in the app calls saveValuation(). Session is mocked signed
 * in throughout; saveValuation itself is mocked to isolate AppContext's
 * *decision* of when to call it from profileRepository's own (separately
 * tested) implementation.
 */
const mockSession = { user: { id: 'user-a', email: 'user-a@example.com', user_metadata: { username: 'usera' } } }

vi.mock('../lib/supabaseClient', () => ({
  isSupabaseConfigured: true,
  getSupabaseClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(),
  }),
}))

const mockSaveValuation = vi.fn().mockResolvedValue({ ok: true, data: undefined })
vi.mock('../services/profileRepository', () => ({
  saveValuation: (...args: unknown[]) => mockSaveValuation(...args),
  migrateLocalProfileToCloud: vi.fn().mockResolvedValue({ ok: true, data: 'skipped_empty_local' }),
}))

const { default: App } = await import('../App')
const { AppProvider, useApp } = await import('./AppContext')
const { loadProfile } = await import('./persistence')

/** Minimal harness to trigger signOutUser directly, bypassing the several
 * screens of UI back-navigation it would otherwise take to reach a visible
 * Sign Out button from deep in the onboarding flow. */
function SignOutHarness() {
  const { signOutUser } = useApp()
  return (
    <button type="button" onClick={() => signOutUser()}>
      trigger-sign-out
    </button>
  )
}

async function reachResult(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('button', { name: /discover your market value/i })[0])
  await user.click(screen.getByRole('button', { name: /working professional/i }))
  await user.click(screen.getByRole('button', { name: /^next/i }))
  await user.click(screen.getByRole('button', { name: /technology/i }))
  await user.click(screen.getByRole('button', { name: /^next/i }))
  await user.selectOptions(screen.getByLabelText(/highest qualification/i), "Bachelor's Degree")
  await user.type(screen.getByLabelText(/institute \/ university/i), 'IIT Bombay')
  await user.type(screen.getByLabelText(/marks \/ cgpa/i), '8.7')
  await user.click(screen.getByRole('button', { name: /^next/i }))
  await user.selectOptions(screen.getByLabelText(/total experience/i), '3-5')
  await user.type(screen.getByLabelText(/current role/i), 'Software Engineer')
  await user.click(screen.getByRole('button', { name: /^next/i }))
  await user.click(screen.getByRole('button', { name: /add a skill/i }))
  await user.type(screen.getByPlaceholderText(/skill name/i), 'AWS')
  await user.click(screen.getByRole('button', { name: /^add$/i }))
  await user.click(screen.getByRole('button', { name: /^next/i })) // skills
  await user.click(screen.getByRole('button', { name: /^next/i })) // certifications — skip
  await user.click(screen.getByRole('button', { name: /^next/i })) // achievements — skip
  await user.selectOptions(screen.getByLabelText(/current location/i), 'Bangalore')
  await user.click(screen.getByRole('button', { name: /analyze my value/i }))
  expect(await screen.findByText(/your market value/i, {}, { timeout: 5000 })).toBeInTheDocument()
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('AppContext — auto-save on reaching Result while signed in', () => {
  it('saves the computed result exactly once for a signed-in user', async () => {
    const user = userEvent.setup()
    render(<App />)
    await reachResult(user)

    expect(mockSaveValuation).toHaveBeenCalledTimes(1)
    expect(mockSaveValuation).toHaveBeenCalledWith('user-a', expect.objectContaining({ domainId: 'technology', marketEvidence: 'partial' }))
  }, 15000)

  it('does not call saveValuation again for the same result on a re-render (no duplicate rows)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await reachResult(user)
    expect(mockSaveValuation).toHaveBeenCalledTimes(1)

    // Navigate away and back to Result with the same underlying profile —
    // must still be exactly one save, not two.
    await user.click(screen.getByRole('button', { name: /view detailed analysis/i }))
    await user.click(screen.getAllByRole('button', { name: /go back/i })[0])
    expect(await screen.findByText(/your market value/i)).toBeInTheDocument()
    expect(mockSaveValuation).toHaveBeenCalledTimes(1)
  }, 15000)
})

describe('AppContext — sign-out clears the local profile draft', () => {
  it('wipes the local profile on sign-out, so it cannot leak into a different account signing in next on the same browser', async () => {
    // Regression test for a real QA finding: on a shared browser, signing
    // out and then signing up/in as a *different* person left the previous
    // person's local draft in localStorage, which migrateLocalProfileToCloud
    // then copied into the new account's cloud profile as though the new
    // person had entered it themselves.
    const { saveProfile } = await import('./persistence')
    const { createEmptyProfile } = await import('../types/profile')
    saveProfile({ ...createEmptyProfile(), domain: 'technology', role: 'working_professional' })
    expect(loadProfile()?.domain).toBe('technology')

    const user = userEvent.setup()
    render(
      <AppProvider>
        <SignOutHarness />
      </AppProvider>,
    )
    await user.click(screen.getByText('trigger-sign-out'))
    await new Promise((r) => setTimeout(r, 0))

    // clearPersistedState() removes the key, but the provider's own
    // "persist on every profile change" effect immediately re-saves the
    // now-reset (empty) profile object afterward — that's fine, since an
    // empty profile carries nothing to leak; what matters is that no
    // meaningful field survives, which is exactly what
    // migrateLocalProfileToCloud's own "is this worth migrating?" check
    // looks at.
    const after = loadProfile()
    expect(after?.domain ?? null).toBeNull()
    expect(after?.role ?? null).toBeNull()
    expect(after?.education.institute ?? '').toBe('')
  })
})
