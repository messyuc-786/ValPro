/**
 * ValPro Universal Valuation Engine
 * ---------------------------------
 * This is a DEMO deterministic model. It does not read live compensation data —
 * every number below is computed from the profile the person entered, combined
 * with a domain intelligence pack (see src/domains). It exists so the
 * architecture (Profile → Domain Intelligence → Valuation → Explanation →
 * Simulation) is real and testable, ready to be pointed at live benchmark data
 * later without changing any screen.
 *
 * The engine never claims to represent live market data — see honesty rules in
 * the product requirements doc.
 */
import type { DomainPack, ScenarioDefinition } from '../types/domain'
import type {
  AchievementEntry,
  DomainId,
  Profile,
  RoleLevel,
} from '../types/profile'
import { experienceYears } from '../types/profile'
import type { Confidence, ScenarioResult, Signal, ValueGap, ValuationResult } from '../types/valuation'
import { getDomainPack } from '../domains/registry'

const ACHIEVEMENT_BASE_VALUE_LPA: Record<AchievementEntry['category'], number> = {
  leadership: 0.5,
  revenue_impact: 0.55,
  cost_saving: 0.45,
  promotion: 0.4,
  award: 0.3,
  publication: 0.3,
  competition: 0.25,
  product_adoption: 0.4,
  other: 0.15,
}

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

/** Role level is derived from years of experience, then nudged by job-title keywords. */
export function deriveRoleLevel(profile: Profile): RoleLevel {
  const years = experienceYears(profile)
  let level: RoleLevel = 'entry'
  if (years >= 12) level = 'lead'
  else if (years >= 7) level = 'senior'
  else if (years >= 3) level = 'mid'
  else if (years >= 1) level = 'junior'

  const title = normalize(profile.experience.currentRole)
  if (/manager|director|head|lead\b|vp\b|principal/.test(title)) {
    level = years >= 5 ? 'lead' : 'senior'
  } else if (/senior|staff|sr\.?\s/.test(title)) {
    if (level === 'entry' || level === 'junior') level = 'mid'
    if (level === 'mid') level = 'senior'
  }
  return level
}

function instituteTier(pack: DomainPack, institute: string): 'tier1' | 'tier2' | 'tier3' {
  const value = normalize(institute)
  if (!value) return 'tier3'
  if (pack.instituteTierKeywords.tier1.some((kw) => value.includes(kw))) return 'tier1'
  if (pack.instituteTierKeywords.tier2.some((kw) => value.includes(kw))) return 'tier2'
  return 'tier3'
}

function locationMultiplier(pack: DomainPack, locationName: string): number {
  const key = normalize(locationName)
  return pack.locationMultipliers[key] ?? pack.defaultLocationMultiplier
}

function skillDemand(pack: DomainPack, skillName: string): number {
  return pack.knownSkills[normalize(skillName)] ?? pack.defaultSkillDemand
}

function certificationValue(pack: DomainPack, certName: string): number {
  return pack.knownCertifications[normalize(certName)] ?? pack.defaultCertificationValue
}

/** Core deterministic calculation — no randomness, same profile always yields the same value. */
function computeMarketValueLPA(profile: Profile, pack: DomainPack): number {
  const years = Math.min(experienceYears(profile), pack.experienceCapYears)
  const roleLevel = deriveRoleLevel(profile)

  let value = pack.baseValueLPA + years * pack.perYearExperienceLPA
  value *= pack.roleLevelMultipliers[roleLevel]

  const tier = instituteTier(pack, profile.education.institute)
  value *= pack.instituteTierMultipliers[tier]

  const targetLocation = profile.location.targetCity || profile.location.current
  value *= locationMultiplier(pack, targetLocation)

  const marks = typeof profile.education.marks === 'number' ? profile.education.marks : 0
  const educationBonus = Math.max(0, marks - 6.5) * 0.28 * (pack.weights.education / 0.15)
  value += educationBonus

  const skillsBonus = profile.skills.reduce(
    (sum, s) => sum + skillDemand(pack, s.name) * (s.proficiency / 100),
    0,
  ) * (pack.weights.skills / 0.18)
  value += skillsBonus

  const certsBonus = profile.certifications.reduce(
    (sum, c) => sum + certificationValue(pack, c.name),
    0,
  ) * (pack.weights.certifications / 0.15)
  value += certsBonus

  const achievementsBonus = profile.achievements.reduce(
    (sum, a) => sum + ACHIEVEMENT_BASE_VALUE_LPA[a.category],
    0,
  ) * (pack.weights.achievements / 0.14)
  value += achievementsBonus

  if (profile.experience.hasLeadershipExperience) {
    value += 0.4 * (pack.weights.experience / 0.28)
  }

  return Math.max(2.0, value)
}

function completeness(profile: Profile): number {
  let filled = 0
  let total = 6
  if (profile.education.institute && profile.education.qualification) filled++
  if (profile.experience.band) filled++
  if (profile.skills.length >= 3) filled++
  if (profile.certifications.length >= 1) filled++
  if (profile.achievements.length >= 1) filled++
  if (profile.location.current) filled++
  return filled / total
}

function confidenceFromCompleteness(ratio: number): Confidence {
  if (ratio >= 0.83) return 'High'
  if (ratio >= 0.5) return 'Medium'
  return 'Low'
}

function positiveSignals(profile: Profile, pack: DomainPack): Signal[] {
  const signals: Signal[] = []
  const marks = typeof profile.education.marks === 'number' ? profile.education.marks : 0

  if (profile.certifications.length > 0 && profile.skills.length > 0) {
    signals.push({ id: 'skills_certs', label: 'Strong technical skills and certifications' })
  } else if (profile.skills.length >= 3) {
    signals.push({ id: 'skills', label: 'Well-rounded, relevant skill set' })
  }

  if (marks >= 8) {
    signals.push({ id: 'academics', label: 'Strong academic background' })
  }

  const tier = instituteTier(pack, profile.education.institute)
  if (tier === 'tier1') {
    signals.push({ id: 'institute', label: 'Recognised, high-tier institute' })
  }

  if (experienceYears(profile) >= 2) {
    signals.push({ id: 'industry_experience', label: 'Relevant industry experience' })
  }

  const hasHighDemandSkill = profile.skills.some((s) => skillDemand(pack, s.name) >= 1.1)
  if (hasHighDemandSkill) {
    signals.push({ id: 'demand', label: pack.highDemandSkillLabel })
  }

  if (profile.experience.hasLeadershipExperience) {
    signals.push({ id: 'leadership', label: 'Demonstrated leadership experience' })
  }

  return signals
}

function improvementSignals(profile: Profile, pack: DomainPack): Signal[] {
  const signals: Signal[] = []

  if (!profile.experience.hasLeadershipExperience) {
    signals.push({ id: 'leadership_gap', label: 'Limited leadership experience' })
  }

  if (pack.id === 'technology' || pack.id === 'fresher') {
    const hasAI = profile.skills.some((s) => normalize(s.name).includes('machine learning') || normalize(s.name).includes('ai'))
    if (!hasAI) signals.push({ id: 'ai_gap', label: 'Can add AI / ML specialization' })
  }

  if (profile.achievements.length < 2) {
    signals.push({ id: 'exposure_gap', label: 'Consider expanding industry exposure' })
  }

  if (profile.certifications.length === 0) {
    signals.push({ id: 'cert_gap', label: 'No certifications on file yet' })
  }

  return signals
}

/** Simulates a scenario by transforming the profile, then re-running the same engine. */
export function applyScenario(profile: Profile, scenario: ScenarioDefinition): Profile {
  switch (scenario.kind) {
    case 'add_certification':
      return {
        ...profile,
        certifications: [
          ...profile.certifications,
          {
            id: `sim-${scenario.id}`,
            name: scenario.payload.certificationName ?? '',
            issuer: scenario.payload.certificationIssuer ?? '',
            year: new Date().getFullYear(),
          },
        ],
      }
    case 'change_location':
      return {
        ...profile,
        location: { ...profile.location, targetCity: (scenario.payload.locationName as never) ?? profile.location.targetCity },
      }
    case 'promote_role_level': {
      const bandOrder = ['lt1', '1-3', '3-5', '5-8', '8-12', '12plus'] as const
      const idx = bandOrder.indexOf(profile.experience.band as (typeof bandOrder)[number])
      const nextBand = bandOrder[Math.min(idx + 1, bandOrder.length - 1)] || '3-5'
      return {
        ...profile,
        experience: { ...profile.experience, band: nextBand, hasLeadershipExperience: true },
      }
    }
    case 'add_skill':
      return {
        ...profile,
        skills: [
          ...profile.skills,
          { id: `sim-${scenario.id}`, name: scenario.payload.skillName ?? '', proficiency: scenario.payload.skillProficiency ?? 60 },
        ],
      }
    default:
      return profile
  }
}

function buildValueGaps(profile: Profile, pack: DomainPack, currentValue: number): ValueGap[] {
  const candidates: { id: string; label: string; detail: string; scenario: ScenarioDefinition }[] = []

  if (!profile.experience.hasLeadershipExperience) {
    candidates.push({
      id: 'gap_leadership',
      label: 'Leadership Experience',
      detail: 'Taking on team or project leadership is one of the fastest ways to move up a role band.',
      scenario: { id: 'gap_leadership', label: '', kind: 'promote_role_level', payload: {} },
    })
  }

  const hasAI = profile.skills.some((s) => normalize(s.name).includes('machine learning') || normalize(s.name).includes('ai'))
  if (!hasAI && (pack.id === 'technology' || pack.id === 'fresher')) {
    candidates.push({
      id: 'gap_ai',
      label: 'AI / ML Specialization',
      detail: 'Adding a machine-learning skill signals readiness for higher-demand roles.',
      scenario: { id: 'gap_ai', label: '', kind: 'add_skill', payload: { skillName: 'machine learning', skillProficiency: 65 } },
    })
  }

  if (profile.achievements.length < 2) {
    candidates.push({
      id: 'gap_exposure',
      label: 'Industry Exposure',
      detail: 'A second measurable achievement broadens your evidence beyond a single project.',
      scenario: { id: 'gap_exposure', label: '', kind: 'add_skill', payload: { skillName: pack.id === 'education' ? 'assessment design' : 'system design', skillProficiency: 55 } },
    })
  }

  if (profile.certifications.length === 0) {
    const [firstCert] = Object.keys(pack.knownCertifications)
    candidates.push({
      id: 'gap_cert',
      label: 'Certification Coverage',
      detail: 'A recognised certification is verifiable evidence a resume line cannot provide alone.',
      scenario: { id: 'gap_cert', label: '', kind: 'add_certification', payload: { certificationName: firstCert } },
    })
  }

  return candidates
    .map((c) => {
      const scenarioProfile = applyScenario(profile, c.scenario)
      const scenarioValue = computeMarketValueLPA(scenarioProfile, pack)
      const delta = Math.max(0.1, scenarioValue - currentValue)
      return {
        id: c.id,
        label: c.label,
        detail: c.detail,
        impactLowLPA: Math.round(delta * 0.75 * 10) / 10,
        impactHighLPA: Math.round(delta * 1.35 * 10) / 10,
      }
    })
    .sort((a, b) => b.impactHighLPA - a.impactHighLPA)
    .slice(0, 3)
}

function buildScenarioResults(profile: Profile, pack: DomainPack, currentValue: number): ScenarioResult[] {
  return pack.scenarioCatalog.map((scenario) => {
    const scenarioProfile = applyScenario(profile, scenario)
    const scenarioValue = Math.round(computeMarketValueLPA(scenarioProfile, pack) * 10) / 10
    return {
      id: scenario.id,
      label: scenario.label,
      currentValueLPA: Math.round(currentValue * 10) / 10,
      scenarioValueLPA: scenarioValue,
      deltaLPA: Math.round((scenarioValue - currentValue) * 10) / 10,
    }
  })
}

function nextMovesFromGaps(gaps: ValueGap[]): string[] {
  const phrasing: Record<string, string> = {
    gap_leadership: 'Look for opportunities to lead a team or project.',
    gap_ai: 'Learn the fundamentals of machine learning and apply them in a project.',
    gap_exposure: 'Document a second measurable achievement from your recent work.',
    gap_cert: 'Pursue a recognised certification relevant to your domain.',
  }
  return gaps.map((g) => phrasing[g.id] ?? `Address: ${g.label}`)
}

export function evaluateProfile(profile: Profile, domainIdOverride?: DomainId): ValuationResult {
  const domainId = domainIdOverride ?? profile.domain ?? 'technology'
  const pack = getDomainPack(domainId)

  const marketValue = computeMarketValueLPA(profile, pack)
  const ratio = completeness(profile)
  const confidence = confidenceFromCompleteness(ratio)

  const spreadFactor = confidence === 'High' ? 0.16 : confidence === 'Medium' ? 0.22 : 0.3
  const lowerRange = Math.max(1.8, marketValue * (1 - spreadFactor))
  const upperRange = marketValue * (1 + spreadFactor * 1.2)

  const gaps = buildValueGaps(profile, pack, marketValue)
  const potentialValue = marketValue + gaps.reduce((sum, g) => sum + g.impactHighLPA, 0) * 0.6

  const normalizedPosition = (marketValue - pack.baseValueLPA) / pack.benchmarkSpreadLPA
  const score = Math.round(Math.min(98, Math.max(8, 40 + normalizedPosition * 100)))
  const percentileTopPercent = Math.round(Math.min(95, Math.max(2, 100 - score)))

  return {
    domainId,
    asOf: new Date().toISOString().slice(0, 10),
    marketValueLPA: Math.round(marketValue * 10) / 10,
    lowerRangeLPA: Math.round(lowerRange * 10) / 10,
    upperRangeLPA: Math.round(upperRange * 10) / 10,
    potentialValueLPA: Math.round(potentialValue * 10) / 10,
    score,
    percentileTopPercent,
    confidence,
    positiveSignals: positiveSignals(profile, pack),
    improvementSignals: improvementSignals(profile, pack),
    valueGaps: gaps,
    scenarios: buildScenarioResults(profile, pack, marketValue),
    nextMoves: nextMovesFromGaps(gaps),
  }
}
