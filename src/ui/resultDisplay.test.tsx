import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarketEvidenceBadge } from './resultDisplay'

/** Regression tests for the post-currency-fix integrity cleanup
 * (docs/VALPRO_POST_FIX_CLEANUP_REPORT.md) — MarketEvidenceBadge is the
 * component that replaced the removed "Top X%" percentile claim, and it
 * must only ever surface the two evidence tiers a result can actually
 * carry ('partial' for every domain today, 'supported' the day real data
 * exists) — never fabricate a ranking or a third state. */
describe('MarketEvidenceBadge', () => {
  it('labels a development-fixture ("partial") result honestly, not as a market ranking', () => {
    render(<MarketEvidenceBadge marketEvidence="partial" />)
    expect(screen.getByText('Partial')).toBeInTheDocument()
    expect(screen.queryByText(/top \d+%/i)).not.toBeInTheDocument()
  })

  it('labels a verified ("supported") result distinctly from a fixture one', () => {
    render(<MarketEvidenceBadge marketEvidence="supported" />)
    expect(screen.getByText('Supported')).toBeInTheDocument()
  })
})
