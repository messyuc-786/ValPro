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

export interface ValuationResult {
  domainId: DomainId
  asOf: string // ISO date string — demo model, not a live feed

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
