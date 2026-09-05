import type { ReactNode } from 'react'
import { IconMinusCircle, IconPlusCircle } from './icons'
import type { Confidence } from '../types/valuation'

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

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const tone = confidence === 'High' ? 'text-[var(--color-positive)]' : confidence === 'Medium' ? 'text-[var(--color-accent)]' : 'text-[var(--color-negative)]'
  return <span className={`font-mono text-[18px] font-semibold ${tone}`}>{confidence}</span>
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
}: {
  rank: number
  label: string
  detail: string
  impactLow: number
  impactHigh: number
}) {
  return (
    <div className="flex gap-3.5 rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
      <span className="font-display text-[22px] font-semibold text-[var(--color-accent)]">{rank}</span>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-[15px] font-semibold text-[var(--color-text)]">{label}</span>
        <span className="text-[12.5px] leading-snug text-[var(--color-muted)]">{detail}</span>
        <span className="mt-1.5 font-mono text-[13px] font-semibold text-[var(--color-positive)] tabular">
          Potential Impact +₹{impactLow.toFixed(1)}L–₹{impactHigh.toFixed(1)}L
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
}: {
  label: string
  currentValue: number
  scenarioValue: number
  delta: number
}) {
  const positive = delta >= 0
  return (
    <div className="flex flex-col gap-2 rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5">
      <span className="text-[14.5px] font-semibold text-[var(--color-text)]">{label}</span>
      <div className="flex items-center gap-2 font-mono text-[13px] tabular">
        <span className="text-[var(--color-muted)]">₹{currentValue.toFixed(1)}L</span>
        <span className="text-[var(--color-muted)]">→</span>
        <span className="text-[var(--color-text)] font-semibold">₹{scenarioValue.toFixed(1)}L</span>
        <span className={`ml-auto font-semibold ${positive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
          {positive ? '+' : ''}
          ₹{delta.toFixed(1)}L
        </span>
      </div>
    </div>
  )
}
