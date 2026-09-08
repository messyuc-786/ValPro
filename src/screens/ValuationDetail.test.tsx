import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockGoTo = vi.fn()
const mockGoBack = vi.fn()
let mockAppState: Record<string, unknown>

vi.mock('../state/AppContext', () => ({
  useApp: () => mockAppState,
}))

const { ValuationDetail } = await import('./ValuationDetail')

function fakeSession(userId = 'user-a') {
  return { user: { id: userId, email: `${userId}@example.com` } } as never
}

function fakeRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'val-1',
    domain_id: 'technology',
    market_evidence: 'partial',
    market_value_lpa: 42.5,
    score: 80,
    confidence: 'High',
    raw_result: {
      domainId: 'technology',
      asOf: '2026-01-01',
      marketEvidence: 'partial',
      currency: 'INR',
      marketValueLPA: 42.5,
      lowerRangeLPA: 35,
      upperRangeLPA: 50,
      potentialValueLPA: 48,
      score: 80,
      percentileTopPercent: 20,
      confidence: 'High',
      positiveSignals: [{ id: 'p1', label: 'Strong academic background' }],
      improvementSignals: [],
      valueGaps: [{ id: 'g1', label: 'Leadership', detail: 'detail text', impactLowLPA: 1, impactHighLPA: 2 }],
      scenarios: [],
      nextMoves: [],
    },
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAppState = { session: fakeSession(), viewingValuation: fakeRow(), goTo: mockGoTo, goBack: mockGoBack }
})

describe('ValuationDetail — historical read-only snapshot', () => {
  it('renders the exact saved values, never recalculated', () => {
    render(<ValuationDetail />)
    expect(screen.getByText(/saved valuation/i)).toBeInTheDocument()
    expect(screen.getByText(/42\.5/)).toBeInTheDocument()
    expect(screen.getByText(/exact snapshot saved on/i)).toBeInTheDocument()
  })

  it('reuses the same presentational pieces as the live Result flow (score, evidence, gaps)', () => {
    render(<ValuationDetail />)
    expect(screen.getByText(/profile strength score/i)).toBeInTheDocument()
    expect(screen.getByText('Strong academic background')).toBeInTheDocument()
    expect(screen.getByText('Leadership')).toBeInTheDocument()
  })

  it('redirects to Sign In when there is no session', () => {
    mockAppState.session = null
    render(<ValuationDetail />)
    expect(mockGoTo).toHaveBeenCalledWith('signIn')
    expect(screen.queryByText(/saved valuation/i)).not.toBeInTheDocument()
  })

  it('redirects to Account when nothing is being viewed (e.g. a direct refresh)', () => {
    mockAppState.viewingValuation = null
    render(<ValuationDetail />)
    expect(mockGoTo).toHaveBeenCalledWith('account')
  })
})
