import { describe, expect, it } from 'vitest'
import { DOMAIN_OPTIONS } from '../types/profile'
import { domainRegistry, getDomainPack } from './registry'

const KNOWN_BENCHMARKED_DOMAINS = ['technology', 'banking', 'education', 'fresher'] as const
const NEWLY_ADDED_DOMAINS = ['business', 'design', 'nonprofit', 'career_switcher'] as const

describe('domain registry', () => {
  it('has a registered pack for every DOMAIN_OPTIONS entry — nothing selectable is unregistered', () => {
    for (const option of DOMAIN_OPTIONS) {
      const pack = getDomainPack(option.id)
      expect(pack, `missing registry entry for ${option.id}`).toBeDefined()
      expect(pack.id).toBe(option.id)
    }
  })

  it('every registered pack carries a category and a valid evidenceStatus', () => {
    for (const option of DOMAIN_OPTIONS) {
      const pack = getDomainPack(option.id)
      expect(pack.category).toBe(option.category)
      expect(['supported', 'partial', 'insufficient']).toContain(pack.evidenceStatus)
    }
  })

  it('only the 4 known benchmarked domains carry a benchmark object', () => {
    for (const option of DOMAIN_OPTIONS) {
      const pack = getDomainPack(option.id)
      const shouldHaveBenchmark = (KNOWN_BENCHMARKED_DOMAINS as readonly string[]).includes(option.id)
      expect(Boolean(pack.benchmark)).toBe(shouldHaveBenchmark)
      expect(pack.evidenceStatus).toBe(shouldHaveBenchmark ? 'partial' : 'insufficient')
    }
  })

  it('every populated benchmark is explicitly tagged as a development fixture, never real data', () => {
    for (const domainId of KNOWN_BENCHMARKED_DOMAINS) {
      const pack = getDomainPack(domainId)
      expect(pack.benchmark?.dataSource).toBe('development_fixture')
    }
  })

  it('includes every newly-added domain from this phase, each selectable with an honest insufficient status', () => {
    for (const domainId of NEWLY_ADDED_DOMAINS) {
      const pack = getDomainPack(domainId)
      expect(pack).toBeDefined()
      expect(pack.evidenceStatus).toBe('insufficient')
      expect(pack.benchmark).toBeUndefined()
    }
  })

  it('includes "Other" as a real, selectable fallback domain', () => {
    const pack = getDomainPack('other')
    expect(pack).toBeDefined()
    expect(pack.evidenceStatus).toBe('insufficient')
  })

  it('has no duplicate domain IDs in DOMAIN_OPTIONS', () => {
    const ids = DOMAIN_OPTIONS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('exposes at least the full breadth of domain categories requested for Phase 3', () => {
    const categories = new Set(DOMAIN_OPTIONS.map((d) => d.category))
    expect(categories.size).toBeGreaterThanOrEqual(8)
  })
})

describe('domain registry — internal consistency of the domainRegistry map itself', () => {
  it('domainRegistry keys match DOMAIN_OPTIONS ids exactly', () => {
    const registryIds = Object.keys(domainRegistry).sort()
    const optionIds = DOMAIN_OPTIONS.map((d) => d.id).sort()
    expect(registryIds).toEqual(optionIds)
  })
})
