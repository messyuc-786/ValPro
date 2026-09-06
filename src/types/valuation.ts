import type { DomainId } from './profile'

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
  asOf: string // ISO date string — demo model, not a live feed
}

/** A domain with a calibrated (still demo, not live) benchmark model — the
 * normal, full result. */
export interface DemoValuationResult extends ValuationResultCommon {
  marketEvidence: 'demo'

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

/** A domain with no benchmark calibration yet. Deliberately carries none of
 * the numeric/explanatory fields above — there is nothing to show instead of
 * inventing them. See Result screen for how this renders. */
export interface InsufficientEvidenceResult extends ValuationResultCommon {
  marketEvidence: 'insufficient'
}

export type ValuationResult = DemoValuationResult | InsufficientEvidenceResult
