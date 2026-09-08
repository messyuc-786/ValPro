import { describe, expect, it } from 'vitest'
import { NoEvidenceProvider } from './marketEvidenceProvider'
import type { MarketEvidenceQuery } from './marketEvidenceProvider'

describe('NoEvidenceProvider', () => {
  it('reports every query as honestly unavailable, never fabricating a source', async () => {
    const result = await NoEvidenceProvider.queryEvidence({ domainId: 'technology', market: 'India' })
    expect(result.available).toBe(false)
    if (result.available) throw new Error('expected unavailable')
    expect(result.reason).toBe('provider_unavailable')
  })

  it('reports unavailable even for a fully-specified, maximally-narrow query — no dimension makes it "find" fake evidence', async () => {
    // Compile-time proof the query contract actually carries every matching
    // dimension the product requires (specialization/industry/companyTier/
    // instituteTier), and a runtime proof that specifying all of them still
    // yields an honest "unavailable," never evidence conjured to fit.
    const query: MarketEvidenceQuery = {
      domainId: 'technology',
      role: 'Software Engineer',
      specialization: 'Backend',
      industry: 'IT Services',
      experienceBand: '3-5',
      instituteTier: 'tier1',
      companyTier: 'Enterprise',
      market: 'India',
      cityRegion: 'Bangalore',
    }
    const result = await NoEvidenceProvider.queryEvidence(query)
    expect(result.available).toBe(false)
  })
})
