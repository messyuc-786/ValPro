import type { ReactNode } from 'react'
import { IconMinusCircle, IconPlusCircle } from './icons'
import type { Confidence } from '../types/valuation'
import type { EvidenceStatus } from '../types/domain'
import { formatCurrencyCompact, type CurrencyCode } from '../types/currency'

export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 border-r border-[var(--color-line)] px-3 py-3 last:border-r-0">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">{label}</span>
      <span className="font-mono text-[18px] font-semibold text-[var(--color-text)] tabular">{value}</span>
      {sub && <span className="text-[11px] text-[var(--color-muted)]">{sub}</span>}
    </div>
  )
}

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="flex rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)]">{children}</div>
}

/** Despite the name (kept to avoid a wider rename churn), this shows
 * evidence STRENGTH — how much of the profile backs the estimate — never
 * statistical confidence. Callers should label it "Evidence Strength", not
 * "Confidence", in any user-facing copy. See
 * docs/VALPRO_POST_FIX_CLEANUP_REPORT.md. */
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const tone = confidence === 'High' ? 'text-[var(--color-positive)]' : confidence === 'Medium' ? 'text-[var(--color-accent)]' : 'text-[var(--color-negative)]'
  return <span className={`font-mono text-[18px] font-semibold ${tone}`}>{confidence}</span>
}

/** Surfaces the domain benchmark's actual evidence tier (never
 * 'insufficient' here — that branch never reaches a rendered result) so the
 * UI discloses that a result comes from a development-fixture calibration
 * ('Partial') rather than implying every number is backed by verified
 * live market data. No new evidence values are invented — this just
 * displays the existing `EvaluatedValuationResult.marketEvidence` field. */
export function MarketEvidenceBadge({ marketEvidence }: { marketEvidence: Extract<EvidenceStatus, 'supported' | 'partial'> }) {
  const tone = marketEvidence === 'supported' ? 'text-[var(--color-positive)]' : 'text-[var(--color-accent)]'
  const label = marketEvidence === 'supported' ? 'Supported' : 'Partial'
  return <span className={`font-mono text-[18px] font-semibold ${tone}`}>{label}</span>
}

export function SignalRow({ label, positive }: { label: string; positive: boolean }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className={positive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}>
        {positive ? <IconPlusCircle className="h-4 w-4" /> : <IconMinusCircle className="h-4 w-4" />}
      </span>
      <span className="text-[14px] leading-snug text-[var(--color-text)]">{label}</span>
    </div>
  )
}

export function GapCard({
  rank,
  label,
  detail,
  impactLow,
  impactHigh,
  currency,
}: {
  rank: number
  label: string
  detail: string
  impactLow: number
  impactHigh: number
  currency: CurrencyCode
}) {
  return (
    <div className="flex gap-3.5 rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
      <span className="font-display text-[22px] font-semibold text-[var(--color-accent-blue)]">{rank}</span>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-[15px] font-semibold text-[var(--color-text)]">{label}</span>
        <span className="text-[12.5px] leading-snug text-[var(--color-muted)]">{detail}</span>
        <span className="mt-1.5 font-mono text-[13px] font-semibold text-[var(--color-positive)] tabular">
          Potential Impact +{formatCurrencyCompact(impactLow, currency)}–{formatCurrencyCompact(impactHigh, currency)}
        </span>
      </div>
    </div>
  )
}

export function ScenarioRow({
  label,
  currentValue,
  scenarioValue,
  delta,
  currency,
}: {
  label: string
  currentValue: number
  scenarioValue: number
  delta: number
  currency: CurrencyCode
}) {
  const positive = delta >= 0
  return (
    <div className="flex flex-col gap-2 rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5">
      <span className="text-[14.5px] font-semibold text-[var(--color-text)]">{label}</span>
      <div className="flex items-center gap-2 font-mono text-[13px] tabular">
        <span className="text-[var(--color-muted)]">{formatCurrencyCompact(currentValue, currency)}</span>
        <span className="text-[var(--color-muted)]">→</span>
        <span className="text-[var(--color-text)] font-semibold">{formatCurrencyCompact(scenarioValue, currency)}</span>
        <span className={`ml-auto font-semibold ${positive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
          {positive ? '+' : ''}
          {formatCurrencyCompact(delta, currency)}
        </span>
      </div>
    </div>
  )
}
