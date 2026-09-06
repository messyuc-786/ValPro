/**
 * The data contract future REAL market evidence must satisfy before it can
 * back a DomainBenchmark with `dataSource: 'verified_market_data'` and a
 * DomainPack with `evidenceStatus: 'supported'`.
 *
 * This file defines shape only. It intentionally contains no instances,
 * fixtures, or example numbers — populating it with anything not genuinely
 * sourced and verifiable would be exactly the fabrication ValPro's honesty
 * rule forbids. See docs/VALPRO_PHASE_3_REPORT.md for what "wiring in real
 * data" actually involves once a source exists.
 */

/** How the figures in one MarketEvidenceSource were actually obtained —
 * shown to the user (see evidence-quality copy in Result / How It Works)
 * so "verified" never means "trust us". */
export type EvidenceQuality =
  | 'verified_survey' // a structured compensation survey with disclosed methodology
  | 'verified_aggregate' // aggregated from multiple named, checkable sources
  | 'self_reported' // user/community self-reported, unverified individually
  | 'estimated' // analyst/expert estimate, not raw observed data

export interface CompensationRange {
  min: number
  max: number
  currency: string // ISO 4217, e.g. 'INR', 'USD'
  /** The unit the min/max are expressed in — LPA (lakhs per annum) is
   * ValPro's internal unit today; a source may report annually, monthly, or
   * hourly and this records which, so conversion is explicit, not assumed. */
  period: 'annual' | 'monthly' | 'hourly'
}

/**
 * One piece of real, sourced market evidence for a domain/role/experience
 * band/region combination. A DomainBenchmark is built BY AGGREGATING one or
 * more of these — the benchmark is the engine-ready calibration; this is
 * the citable evidence behind it, kept so the calibration can be audited,
 * refreshed, or retracted later.
 */
export interface MarketEvidenceSource {
  id: string

  // --- provenance ---
  source: string // e.g. "Glassdoor India Compensation Report 2026"
  sourceUrl?: string
  evidenceQuality: EvidenceQuality
  methodology: string // one or two sentences: how the figures were derived
  sampleSize?: number

  // --- what it's evidence of ---
  domainId: string // matches DomainId once assigned to a pack
  role: string
  experienceBand: string // matches ExperienceBandId shape, e.g. '3-5'
  educationLevel?: string // matches Qualification, where education level is relevant to the role
  market: string // country, e.g. "India"
  cityRegion?: string // e.g. "Bangalore" — omitted where the source is not city-specific

  compensation: CompensationRange

  // --- freshness ---
  dateCollected: string // ISO date — when the underlying data was gathered
  dateAdded: string // ISO date — when this record entered ValPro
  /** A source stops being usable for 'supported' status after this long
   * without being refreshed — freshness is a property of the evidence, not
   * a vague feeling. Left unset only for sources with no natural expiry
   * (e.g. a fixed historical study cited for context). */
  staleAfterMonths?: number
}

/**
 * The real evidence registry. Empty until real, sourced data exists — see
 * the file header. Nothing in the app reads from this yet; wiring it into
 * domain benchmarks is future work once it has real content.
 */
export const marketEvidenceSources: MarketEvidenceSource[] = []
