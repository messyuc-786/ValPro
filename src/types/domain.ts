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

/**
 * The numeric calibration a domain needs before the engine can compute a
 * value for it. Every field here is hand-authored demo data, not verified
 * market research — see each domain pack file's own header comment and
 * docs/VALPRO_CURRENT_BASELINE.md. A domain with no `DomainBenchmark`
 * (see `DomainPack.benchmarkStatus` below) is not silently given fake
 * numbers to fill this shape; it gets an honest "insufficient evidence"
 * result instead (see valuationEngine.ts).
 */
export interface DomainBenchmark {
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

export interface DomainPack {
  id: DomainId
  label: string
  shortLabel: string
  description: string

  /**
   * 'demo'          — `benchmark` is populated with a hand-authored, clearly
   *                    demo-labeled calibration; the engine computes a value.
   * 'insufficient'  — no calibration exists yet; `benchmark` is undefined and
   *                    the engine returns an honest insufficient-evidence
   *                    result instead of inventing one. The domain is still
   *                    fully selectable — this only affects what Result shows.
   */
  benchmarkStatus: 'demo' | 'insufficient'
  benchmark?: DomainBenchmark
}
