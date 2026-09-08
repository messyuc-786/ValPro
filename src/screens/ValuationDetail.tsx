import { useEffect } from 'react'
import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { IconChevronLeft } from '../ui/icons'
import { backdropFor } from '../navigation/flow'
import { DOMAIN_OPTIONS } from '../types/profile'
import { currencySymbol, currencyUnitLabel, formatCurrencyCompact } from '../types/currency'
import { ConfidenceBadge, GapCard, MarketEvidenceBadge, SignalRow, StatRow, StatTile } from '../ui/resultDisplay'

/**
 * Read-only view of one saved valuation (Account → "My Valuations" → a
 * card). Renders `viewingValuation.raw_result` exactly as stored — never
 * recomputed against the current profile or the current engine/benchmark,
 * which is the whole point of a historical snapshot. Reuses the same
 * presentational pieces (StatTile/StatRow/ConfidenceBadge/MarketEvidenceBadge/
 * SignalRow/GapCard) that ResultOverview/WhyThisValue/ImprovementAreas use,
 * rather than a second set of components — this is one condensed page
 * instead of that flow's four screens because a frozen snapshot has no
 * next-step navigation between "why" and "gaps," and What-If (inherently
 * forward-looking/interactive) does not apply to a historical read at all.
 */
export function ValuationDetail() {
  const { session, viewingValuation, goTo, goBack } = useApp()

  useEffect(() => {
    if (!session) {
      goTo('signIn')
      return
    }
    if (!viewingValuation || viewingValuation.raw_result.marketEvidence === 'insufficient') {
      // Reached directly (e.g. a refresh) with nothing selected, or a
      // defensive fallback — nothing in the app saves an insufficient
      // result today, but this guards the type narrowing below either way.
      goTo('account')
    }
  }, [session, viewingValuation, goTo])

  if (!session || !viewingValuation) return null
  const result = viewingValuation.raw_result
  if (result.marketEvidence === 'insufficient') return null

  const domainLabel = DOMAIN_OPTIONS.find((d) => d.id === viewingValuation.domain_id)?.label ?? viewingValuation.domain_id
  const savedDate = new Date(viewingValuation.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <Backdrop image={backdropFor('valuationDetail')}>
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Wordmark />
          <span className="font-mono text-[11.5px] text-[var(--color-muted)] tabular">{savedDate}</span>
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Saved Valuation — {domainLabel}</p>
        <p className="mt-2 font-display text-[40px] font-medium leading-none tabular">
          <span className="text-[var(--color-accent-blue)]">{currencySymbol(result.currency)}</span>
          {result.marketValueLPA.toFixed(1)} <span className="text-[22px] font-sans font-semibold text-[var(--color-muted)]">{currencyUnitLabel(result.currency)}</span>
        </p>
        <div className="mt-4 flex items-baseline gap-2 font-mono text-[14px] text-[var(--color-muted)] tabular">
          <span>{formatCurrencyCompact(result.lowerRangeLPA, result.currency)}</span>
          <span className="h-px flex-1 bg-[var(--color-line-strong)]" />
          <span>{formatCurrencyCompact(result.upperRangeLPA, result.currency)}</span>
        </div>
        <p className="mt-1 text-[11.5px] text-[var(--color-muted)]">Estimated Range (as saved)</p>

        <div className="mt-6">
          <StatRow>
            <StatTile label="Profile Strength Score" value={`${result.score}/100`} />
            <StatTile label="Market Evidence" value={<MarketEvidenceBadge marketEvidence={result.marketEvidence} />} />
            <StatTile label="Evidence Strength" value={<ConfidenceBadge confidence={result.confidence} />} />
          </StatRow>
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-positive)]">Positive Signals</p>
        <div className="mt-2 flex flex-col divide-y divide-[var(--color-line)]">
          {result.positiveSignals.length === 0 ? (
            <p className="py-2 text-[13.5px] text-[var(--color-muted)]">None recorded for this saved result.</p>
          ) : (
            result.positiveSignals.map((s) => <SignalRow key={s.id} label={s.label} positive />)
          )}
        </div>

        {result.valueGaps.length > 0 && (
          <>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Value Gaps (as saved)</p>
            <div className="mt-2 flex flex-col gap-2.5">
              {result.valueGaps.map((gap, i) => (
                <GapCard key={gap.id} rank={i + 1} label={gap.label} detail={gap.detail} impactLow={gap.impactLowLPA} impactHigh={gap.impactHighLPA} currency={result.currency} />
              ))}
            </div>
          </>
        )}

        <p className="mt-6 text-[11.5px] leading-relaxed text-[var(--color-muted)]">
          This is the exact snapshot saved on {savedDate} — not recalculated against any later changes to your profile or to ValPro's benchmarks.
        </p>
      </div>

      <div className="shrink-0 border-t border-[var(--color-line)] px-6 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-line-strong)]"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
          <Button variant="outline" className="flex-1" onClick={() => goTo('account')}>
            Back to Account
          </Button>
        </div>
        <div className="mt-2.5 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
