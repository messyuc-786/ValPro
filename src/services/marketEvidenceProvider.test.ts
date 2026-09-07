import { describe, expect, it } from 'vitest'
import { NoEvidenceProvider } from './marketEvidenceProvider'

describe('NoEvidenceProvider', () => {
  it('reports every query as honestly unavailable, never fabricating a source', async () => {
    const result = await NoEvidenceProvider.queryEvidence({ domainId: 'technology', market: 'India' })
    expect(result.available).toBe(false)
    if (result.available) throw new Error('expected unavailable')
    expect(result.reason).toBe('provider_unavailable')
  })
})
