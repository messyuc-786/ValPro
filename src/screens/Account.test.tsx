import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyProfile } from '../types/profile'

/**
 * Account.tsx unit-tested in isolation: useApp() and the repository
 * functions it calls are mocked directly, rather than driving the full
 * App tree, so the screen's own logic (auth guard, load/empty/error
 * states, delete-confirm flow, and which user id it actually passes to
 * the repository — the security-relevant part) is pinned down precisely.
 */
const mockGoTo = vi.fn()
const mockGoBack = vi.fn()
const mockSignOutUser = vi.fn().mockResolvedValue(undefined)
const mockSetViewingValuation = vi.fn()
let mockAppState: Record<string, unknown>

vi.mock('../state/AppContext', () => ({
  useApp: () => mockAppState,
}))

const mockLoadSavedValuations = vi.fn()
const mockDeleteValuation = vi.fn()
vi.mock('../services/profileRepository', () => ({
  loadSavedValuations: (...args: unknown[]) => mockLoadSavedValuations(...args),
  deleteValuation: (...args: unknown[]) => mockDeleteValuation(...args),
}))

const { Account } = await import('./Account')

function fakeSession(userId = 'user-a') {
  return { user: { id: userId, email: `${userId}@example.com`, user_metadata: { username: `${userId}name` } } } as never
}

function fakeValuationRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'val-1',
    domain_id: 'technology',
    market_evidence: 'partial',
    market_value_lpa: 42.5,
    score: 80,
    confidence: 'High',
    raw_result: { marketEvidence: 'partial', currency: 'INR', marketValueLPA: 42.5, lowerRangeLPA: 35, upperRangeLPA: 50 },
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAppState = {
    session: fakeSession(),
    profile: { ...createEmptyProfile(), domain: 'technology', role: 'working_professional', experience: { ...createEmptyProfile().experience, currentRole: 'Senior Engineer' } },
    goTo: mockGoTo,
    goBack: mockGoBack,
    signOutUser: mockSignOutUser,
    setViewingValuation: mockSetViewingValuation,
  }
})

describe('Account — authentication guard', () => {
  it('redirects to Sign In when no session exists, rather than rendering private data', () => {
    mockAppState.session = null
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [] })
    render(<Account />)
    expect(mockGoTo).toHaveBeenCalledWith('signIn')
    expect(screen.queryByText(/my valuations/i)).not.toBeInTheDocument()
  })

  it('renders account content for an authenticated session', async () => {
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [] })
    render(<Account />)
    expect(await screen.findByText(/my valuations/i)).toBeInTheDocument()
    expect(mockGoTo).not.toHaveBeenCalledWith('signIn')
  })
})

describe('Account — profile display', () => {
  it('renders profile identity fields from the existing profile model, not fabricated ones', async () => {
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [] })
    render(<Account />)
    expect(await screen.findByText('user-aname')).toBeInTheDocument()
    expect(screen.getByText('user-a@example.com')).toBeInTheDocument()
    expect(screen.getByText('Technology / IT')).toBeInTheDocument()
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
    expect(screen.getByText('Working Professional')).toBeInTheDocument()
  })
})

describe('Account — valuation history loading states', () => {
  it('shows a loading state before the repository call resolves', () => {
    mockLoadSavedValuations.mockReturnValue(new Promise(() => {})) // never resolves
    render(<Account />)
    expect(screen.getByText(/loading your saved valuations/i)).toBeInTheDocument()
  })

  it('shows an honest error state when the repository call fails', async () => {
    mockLoadSavedValuations.mockResolvedValue({ ok: false, reason: 'error', message: 'boom' })
    render(<Account />)
    expect(await screen.findByText(/couldn't load your valuations/i)).toBeInTheDocument()
  })

  it('shows the empty state with a real call-to-action when there is no history', async () => {
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [] })
    render(<Account />)
    expect(await screen.findByText(/no valuations yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calculate my value/i })).toBeInTheDocument()
  })

  it('scopes the load call to the current authenticated user\'s id — never a hardcoded or different one', async () => {
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [] })
    render(<Account />)
    await waitFor(() => expect(mockLoadSavedValuations).toHaveBeenCalledWith('user-a'))
  })
})

describe('Account — valuation cards', () => {
  it('renders a card with domain, value, and evidence for each saved valuation', async () => {
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [fakeValuationRow()] })
    render(<Account />)
    const card = await screen.findByTestId('valuation-card')
    expect(card).toHaveTextContent('Technology / IT')
    expect(card).toHaveTextContent('Partial')
  })

  it('opens a historical valuation by setting it as the viewed valuation and navigating', async () => {
    const user = userEvent.setup()
    const row = fakeValuationRow()
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [row] })
    render(<Account />)
    const card = await screen.findByTestId('valuation-card')
    await user.click(card.querySelector('button')!)
    expect(mockSetViewingValuation).toHaveBeenCalledWith(row)
    expect(mockGoTo).toHaveBeenCalledWith('valuationDetail')
  })

  it('requires confirmation before deleting, and only deletes the confirmed row for the current user', async () => {
    const user = userEvent.setup()
    const row = fakeValuationRow()
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [row] })
    mockDeleteValuation.mockResolvedValue({ ok: true, data: undefined })
    render(<Account />)
    await screen.findByTestId('valuation-card')

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(screen.getByText(/delete this valuation\?/i)).toBeInTheDocument()
    expect(mockDeleteValuation).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.queryByText(/delete this valuation\?/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i, hidden: false }))
    await waitFor(() => expect(mockDeleteValuation).toHaveBeenCalledWith('user-a', 'val-1'))
  })

  it('removes the valuation from the visible list after a successful delete, without a full reload', async () => {
    const user = userEvent.setup()
    const row = fakeValuationRow()
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [row] })
    mockDeleteValuation.mockResolvedValue({ ok: true, data: undefined })
    render(<Account />)
    await screen.findByTestId('valuation-card')

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(screen.queryByTestId('valuation-card')).not.toBeInTheDocument())
  })

  it('shows an error message and keeps the row visible when delete fails', async () => {
    const user = userEvent.setup()
    const row = fakeValuationRow()
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [row] })
    mockDeleteValuation.mockResolvedValue({ ok: false, reason: 'error', message: 'boom' })
    render(<Account />)
    await screen.findByTestId('valuation-card')

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(await screen.findByText(/couldn't delete that valuation/i)).toBeInTheDocument()
    expect(screen.getByTestId('valuation-card')).toBeInTheDocument()
  })
})

describe('Account — sign out', () => {
  it('calls the existing auth service and returns to Welcome', async () => {
    const user = userEvent.setup()
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [] })
    render(<Account />)
    await screen.findByText(/my valuations/i)
    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockSignOutUser).toHaveBeenCalled()
    await waitFor(() => expect(mockGoTo).toHaveBeenCalledWith('welcome'))
  })
})

describe('Account — security', () => {
  it('never passes another user\'s id to the repository, even across two different signed-in sessions', async () => {
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [] })
    const { unmount } = render(<Account />)
    await waitFor(() => expect(mockLoadSavedValuations).toHaveBeenCalledWith('user-a'))
    unmount()

    mockAppState = { ...mockAppState, session: fakeSession('user-b') }
    mockLoadSavedValuations.mockClear()
    render(<Account />)
    await waitFor(() => expect(mockLoadSavedValuations).toHaveBeenCalledWith('user-b'))
    expect(mockLoadSavedValuations).not.toHaveBeenCalledWith('user-a')
  })

  it('deletes only using the current session\'s user id, never a value read from the row itself', async () => {
    const user = userEvent.setup()
    const row = fakeValuationRow({ id: 'val-owned-by-user-a' })
    mockLoadSavedValuations.mockResolvedValue({ ok: true, data: [row] })
    mockDeleteValuation.mockResolvedValue({ ok: true, data: undefined })
    render(<Account />)
    await screen.findByTestId('valuation-card')

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(mockDeleteValuation).toHaveBeenCalledWith('user-a', 'val-owned-by-user-a'))
  })
})
