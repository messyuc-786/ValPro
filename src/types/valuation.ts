import type { DomainId } from './profile'
import type { EvidenceStatus } from './domain'

export type Confidence = 'Low' | 'Medium' | 'High'

export interface Signal {
  id: string
  label: string
}

export interface ValueGap {
  id: string
  label: string
  detail: string
  impactLowLPA: number
  impactHighLPA: number
}

export interface ScenarioResult {
  id: string
  label: string
  currentValueLPA: number
  scenarioValueLPA: number
  deltaLPA: number
}

interface ValuationResultCommon {
  domainId: DomainId
  asOf: string // ISO date string — computed at request time, not a live feed
}

/** A domain the engine could actually compute a value for — either
 * 'supported' (verified market evidence; no domain uses this yet) or
 * 'partial' (a hand-authored development-fixture calibration; what the
 * current 4 domains produce). Both share this exact shape — the only
 * difference is how much the number should be trusted, which is exactly
 * what `marketEvidence` tells the UI. */
export interface EvaluatedValuationResult extends ValuationResultCommon {
  marketEvidence: Extract<EvidenceStatus, 'supported' | 'partial'>

  marketValueLPA: number
  lowerRangeLPA: number
  upperRangeLPA: number
  potentialValueLPA: number

  score: number // 0-100
  percentileTopPercent: number // "Top X%" — lower is better
  confidence: Confidence

  positiveSignals: Signal[]
  improvementSignals: Signal[]
  valueGaps: ValueGap[]
  scenarios: ScenarioResult[]
  nextMoves: string[]
}

/** A domain with no benchmark calibration at all. Deliberately carries none
 * of the numeric/explanatory fields above — there is nothing to show
 * instead of inventing them — but does carry enough structure for Result to
 * explain *why*, not just *that*, evidence is insufficient. */
export interface InsufficientEvidenceResult extends ValuationResultCommon {
  marketEvidence: 'insufficient'

  /** One-sentence, user-facing reason there's no result. */
  reason: string
  /** What would need to exist for this domain to move to 'partial' or
   * 'supported' — shown as a short list, not prose. */
  missingEvidence: string[]
  /** A concrete, real action the user can take right now (never "wait" as
   * the only option) — e.g. choosing an adjacent domain that does have a
   * result today. */
  suggestedAction: string
  /** 0-1. How much of the profile the person actually filled in, computed
   * the same way regardless of domain — shown so "we can't value your
   * domain yet" doesn't read as "we don't have your information yet". */
  profileCompletenessRatio: number
}

export type ValuationResult = EvaluatedValuationResult | InsufficientEvidenceResult
