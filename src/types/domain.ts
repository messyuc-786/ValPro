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
 * How much the engine can trust the number it's about to compute for a
 * domain. Shared with ValuationResult (src/types/valuation.ts) so a
 * DomainPack's status and the result it produces always agree.
 *
 * - 'supported'    — a calibration built from genuinely sourced, verifiable
 *                     market evidence (see src/types/marketEvidence.ts for
 *                     the data contract that evidence must satisfy). No
 *                     domain uses this today — none has real sourced data
 *                     yet — but the type/engine fully support it so wiring
 *                     one in later is a data change, not a code change.
 * - 'partial'      — a calibration exists (`DomainBenchmark` below is
 *                     populated), but it's hand-authored development
 *                     fixture data, not verified market research. The
 *                     engine still computes a full result, clearly tagged
 *                     `marketEvidence: 'partial'` end to end so it is never
 *                     confused for real data in the UI or in a saved
 *                     result. This is what the current 4 domains are.
 * - 'insufficient' — no calibration exists at all. `benchmark` is
 *                     undefined; the engine returns an honest
 *                     insufficient-evidence result instead of inventing
 *                     one. The domain is still fully selectable.
 */
export type EvidenceStatus = 'supported' | 'partial' | 'insufficient'

/**
 * The numeric calibration a domain needs before the engine can compute a
 * value for it. `dataSource` makes the fixture/real distinction a checkable
 * field, not just a code comment — every populated benchmark today is
 * 'development_fixture', hand-authored, not verified market research (see
 * each domain pack file's own header comment and
 * docs/VALPRO_CURRENT_BASELINE.md).
 */
export interface DomainBenchmark {
  /** 'development_fixture' for every benchmark that exists today. Reserved
   * for 'verified_market_data' once a benchmark is actually built from a
   * MarketEvidenceSource (src/types/marketEvidence.ts) rather than authored
   * by hand — that change alone (plus flipping the pack's evidenceStatus to
   * 'supported') is what "adding real data" means; no engine change. */
  dataSource: 'development_fixture' | 'verified_market_data'

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
  /** Grouping used for Domain Selection's search/section UI — see
   * DOMAIN_CATEGORIES in src/types/profile.ts for the fixed category list. */
  category: string

  evidenceStatus: EvidenceStatus
  /** Populated only when evidenceStatus is 'supported' or 'partial'. */
  benchmark?: DomainBenchmark
}
