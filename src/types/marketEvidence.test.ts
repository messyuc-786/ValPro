import { describe, expect, it } from 'vitest'
import type { MarketEvidenceSource } from './marketEvidence'
import { marketEvidenceSources } from './marketEvidence'

/**
 * Regression tests for the market-evidence data contract
 * (docs/VALPRO_MARKET_DATA_STATUS.md). This is a shape/contract test, not a
 * data test — there is no real evidence to test against yet, by design.
 */
describe('MarketEvidenceSource contract', () => {
  it('accepts a fully-populated source covering every required and optional dimension', () => {
    // Compile-time proof the type actually has every field the product
    // requires (domain, role, specialization, experience band, market,
    // industry, company tier, education tier, min/median/max, currency,
    // source/provider, source URL, source date, sample size, evidence
    // quality, evidence status) — if a future edit accidentally narrows or
    // removes one of these, this object literal fails to typecheck.
    const source: MarketEvidenceSource = {
      id: 'example-only-for-shape-test',
      source: 'Example Compensation Survey 2026',
      sourceUrl: 'https://example.com/survey-2026',
      evidenceQuality: 'verified_survey',
      methodology: 'Structured employer-reported survey, disclosed sampling.',
      sampleSize: 500,
      domainId: 'technology',
      role: 'Software Engineer',
      specialization: 'Backend',
      industry: 'IT Services',
      experienceBand: '3-5',
      educationLevel: "Bachelor's Degree",
      instituteTier: 'tier1',
      companyTier: 'Enterprise',
      market: 'India',
      cityRegion: 'Bangalore',
      compensation: { min: 10, max: 20, median: 15, currency: 'INR', period: 'annual' },
      dateCollected: '2026-01-01',
      dateAdded: '2026-01-02',
      staleAfterMonths: 12,
      evidenceStatus: 'supported',
    }
    expect(source.evidenceStatus).toBe('supported')
    expect(source.instituteTier).toBe('tier1')
    expect(source.compensation.median).toBe(15)
  })

  it('still allows every dimension beyond the required minimum to be omitted, since not every source segments that finely', () => {
    const minimal: MarketEvidenceSource = {
      id: 'minimal',
      source: 'Example Source',
      evidenceQuality: 'estimated',
      methodology: 'n/a',
      domainId: 'technology',
      role: 'Software Engineer',
      experienceBand: '3-5',
      market: 'India',
      compensation: { min: 10, max: 20, currency: 'INR', period: 'annual' },
      dateCollected: '2026-01-01',
      dateAdded: '2026-01-02',
      evidenceStatus: 'partial',
    }
    expect(minimal.specialization).toBeUndefined()
    expect(minimal.instituteTier).toBeUndefined()
    expect(minimal.compensation.median).toBeUndefined()
  })

  it('the real evidence registry remains empty — no fabricated source has been added', () => {
    // This is the actual honesty guarantee: it must fail loudly the moment
    // anyone adds a fixture/placeholder/example entry to the real registry
    // instead of a domain pack's development-fixture benchmark.
    expect(marketEvidenceSources).toEqual([])
  })
})
