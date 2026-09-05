import type { DomainId, RoleLevel } from './profile'

/** Relative weighting of each signal group. Values are proportions and need not sum to 1 —
 * the engine normalises. Keeping them explicit per domain is what lets a Technology
 * profile and a Teaching profile be scored on genuinely different terms. */
export interface DomainWeights {
  education: number
  experience: number
  skills: number
  certifications: number
  achievements: number
  location: number
}

export type ScenarioKind = 'add_certification' | 'change_location' | 'promote_role_level' | 'add_skill'

export interface ScenarioDefinition {
  id: string
  label: string
  kind: ScenarioKind
  payload: {
    certificationName?: string
    certificationIssuer?: string
    locationName?: string
    skillName?: string
    skillProficiency?: number
  }
}

export interface DomainPack {
  id: DomainId
  label: string
  shortLabel: string
  description: string

  /** Base annual value (LPA) for an entry-level profile in this domain, before multipliers. */
  baseValueLPA: number
  /** Value added per year of relevant experience, up to the cap. */
  perYearExperienceLPA: number
  experienceCapYears: number

  roleLevelMultipliers: Record<RoleLevel, number>

  weights: DomainWeights

  /** Institute keywords (matched case-insensitively as substrings) that signal each tier. */
  instituteTierKeywords: {
    tier1: string[]
    tier2: string[]
  }
  instituteTierMultipliers: { tier1: number; tier2: number; tier3: number }

  /** Known skills and their relative market-demand weight. Unlisted skills use defaultSkillDemand. */
  knownSkills: Record<string, number>
  defaultSkillDemand: number

  /** Known certifications and their value contribution in LPA. Unlisted certs use defaultCertificationValue. */
  knownCertifications: Record<string, number>
  defaultCertificationValue: number

  locationMultipliers: Record<string, number>
  defaultLocationMultiplier: number

  /** Rough spread (LPA) of the comparable population, used to normalise score & percentile. */
  benchmarkSpreadLPA: number

  /** Preset What-If scenarios shown in the simulator for this domain. */
  scenarioCatalog: ScenarioDefinition[]

  /** Domain-specific phrasing for the "high demand" positive signal, kept out of the engine. */
  highDemandSkillLabel: string
}
