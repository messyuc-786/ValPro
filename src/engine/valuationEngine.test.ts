import { describe, expect, it } from 'vitest'
import { createEmptyProfile } from '../types/profile'
import type { Profile } from '../types/profile'
import { applyScenario, deriveRoleLevel, evaluateProfile } from './valuationEngine'
import { technologyPack } from '../domains/technology'

function techProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    ...createEmptyProfile(),
    role: 'working_professional',
    domain: 'technology',
    education: { qualification: "Bachelor's Degree", specialization: 'Computer Science', institute: 'Indian Institute of Technology (IIT)', graduationYear: 2019, marks: 8.7 },
    experience: { band: '3-5', currentRole: 'Software Engineer', currentCompany: 'TechSolutions Pvt. Ltd.', industry: 'IT Services', hasLeadershipExperience: false },
    skills: [
      { id: '1', name: 'Java', proficiency: 90 },
      { id: '2', name: 'AWS', proficiency: 75 },
      { id: '3', name: 'System Design', proficiency: 60 },
    ],
    certifications: [{ id: '1', name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', year: 2024 }],
    achievements: [{ id: '1', title: 'Reduced cloud infra cost by 22%', category: 'cost_saving', year: 2024 }],
    location: { current: 'Delhi NCR', targetCity: 'Delhi NCR', targetMarket: 'India' },
    ...overrides,
  }
}

describe('deriveRoleLevel', () => {
  it('treats a fresher-band profile as entry level', () => {
    const profile = techProfile({ experience: { band: 'lt1', currentRole: '', currentCompany: '', industry: '', hasLeadershipExperience: false } })
    expect(deriveRoleLevel(profile)).toBe('entry')
  })

  it('elevates a manager job title with 5+ years to lead level', () => {
    const profile = techProfile({ experience: { band: '5-8', currentRole: 'Engineering Manager', currentCompany: 'X', industry: 'IT', hasLeadershipExperience: true } })
    expect(deriveRoleLevel(profile)).toBe('lead')
  })

  it('caps a manager job title with under 5 years at senior, not lead', () => {
    const profile = techProfile({ experience: { band: '3-5', currentRole: 'Engineering Manager', currentCompany: 'X', industry: 'IT', hasLeadershipExperience: true } })
    expect(deriveRoleLevel(profile)).toBe('senior')
  })

  it('reads 12+ years as lead level', () => {
    const profile = techProfile({ experience: { band: '12plus', currentRole: 'Staff Engineer', currentCompany: 'X', industry: 'IT', hasLeadershipExperience: false } })
    expect(deriveRoleLevel(profile)).toBe('lead')
  })
})

describe('evaluateProfile — Technology domain', () => {
  it('returns a coherent, internally consistent result', () => {
    const result = evaluateProfile(techProfile())
    expect(result.domainId).toBe('technology')
    expect(result.marketValueLPA).toBeGreaterThan(0)
    expect(result.lowerRangeLPA).toBeLessThan(result.marketValueLPA)
    expect(result.upperRangeLPA).toBeGreaterThan(result.marketValueLPA)
    expect(result.potentialValueLPA).toBeGreaterThanOrEqual(result.marketValueLPA)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.percentileTopPercent).toBeGreaterThanOrEqual(1)
    expect(result.percentileTopPercent).toBeLessThanOrEqual(99)
  })

  it('is deterministic for the same profile', () => {
    const profile = techProfile()
    const a = evaluateProfile(profile)
    const b = evaluateProfile(profile)
    expect(a.marketValueLPA).toBe(b.marketValueLPA)
    expect(a.score).toBe(b.score)
  })

  it('values more experience higher, holding everything else constant', () => {
    const junior = evaluateProfile(techProfile({ experience: { band: '1-3', currentRole: 'Software Engineer', currentCompany: 'X', industry: 'IT', hasLeadershipExperience: false } }))
    const senior = evaluateProfile(techProfile({ experience: { band: '8-12', currentRole: 'Software Engineer', currentCompany: 'X', industry: 'IT', hasLeadershipExperience: false } }))
    expect(senior.marketValueLPA).toBeGreaterThan(junior.marketValueLPA)
  })

  it('rewards a tier-1 institute over an unnamed one', () => {
    const tier1 = evaluateProfile(techProfile())
    const tier3 = evaluateProfile(techProfile({ education: { ...techProfile().education, institute: 'City Skills Academy' } }))
    expect(tier1.marketValueLPA).toBeGreaterThan(tier3.marketValueLPA)
  })

  it('produces High confidence for a fully filled profile and Low for a bare one', () => {
    const full = evaluateProfile(techProfile())
    expect(full.confidence).toBe('High')

    const bare = createEmptyProfile()
    bare.role = 'fresher'
    bare.domain = 'technology'
    const sparse = evaluateProfile(bare)
    expect(sparse.confidence).toBe('Low')
  })

  it('ranks value gaps by potential impact, largest first', () => {
    const result = evaluateProfile(techProfile({ experience: { band: '3-5', currentRole: 'Software Engineer', currentCompany: 'X', industry: 'IT', hasLeadershipExperience: false }, achievements: [] }))
    expect(result.valueGaps.length).toBeGreaterThan(0)
    for (let i = 1; i < result.valueGaps.length; i++) {
      expect(result.valueGaps[i - 1].impactHighLPA).toBeGreaterThanOrEqual(result.valueGaps[i].impactHighLPA)
    }
  })

  it('never presents a leadership gap for someone who already has leadership experience', () => {
    const result = evaluateProfile(techProfile({ experience: { band: '3-5', currentRole: 'Software Engineer', currentCompany: 'X', industry: 'IT', hasLeadershipExperience: true } }))
    expect(result.valueGaps.some((g) => g.id === 'gap_leadership')).toBe(false)
    expect(result.positiveSignals.some((s) => s.id === 'leadership')).toBe(true)
  })
})

describe('evaluateProfile — Fresher domain never returns zero value', () => {
  it('gives a fresher with only education signals a non-zero, non-trivial value', () => {
    const fresher = createEmptyProfile()
    fresher.role = 'fresher'
    fresher.domain = 'fresher'
    fresher.education = { qualification: "Bachelor's Degree", specialization: 'Computer Science', institute: 'National Institute of Technology (NIT)', graduationYear: 2026, marks: 8.2 }
    fresher.experience = { band: 'lt1', currentRole: '', currentCompany: '', industry: '', hasLeadershipExperience: false }
    fresher.location = { current: 'Bangalore', targetCity: 'Bangalore', targetMarket: 'India' }

    const result = evaluateProfile(fresher)
    expect(result.marketValueLPA).toBeGreaterThan(2)
    expect(result.nextMoves.length).toBeGreaterThan(0)
  })
})

describe('domain intelligence — same inputs, different domains diverge', () => {
  it('does not value a Technology and Education profile identically', () => {
    const base = techProfile()
    const asEducation = evaluateProfile({ ...base, domain: 'education' })
    const asTechnology = evaluateProfile({ ...base, domain: 'technology' })
    expect(asEducation.marketValueLPA).not.toBe(asTechnology.marketValueLPA)
  })
})

describe('applyScenario + What-If simulation', () => {
  it('adding a certification scenario increases the modeled value', () => {
    const profile = techProfile({ certifications: [] })
    const before = evaluateProfile(profile).marketValueLPA
    const scenario = technologyPack.scenarioCatalog.find((s) => s.id === 'aws_cert')!
    const after = evaluateProfile(applyScenario(profile, scenario)).marketValueLPA
    expect(after).toBeGreaterThan(before)
  })

  it('every catalog scenario for the technology pack is reflected in scenario results', () => {
    const profile = techProfile()
    const result = evaluateProfile(profile)
    expect(result.scenarios.length).toBe(technologyPack.scenarioCatalog.length)
    result.scenarios.forEach((s) => {
      expect(typeof s.deltaLPA).toBe('number')
    })
  })
})
