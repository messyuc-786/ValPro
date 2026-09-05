import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { ConfidenceBadge, StatRow, StatTile } from '../ui/resultDisplay'
import { IconArrowRight } from '../ui/icons'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { backdropFor } from '../navigation/flow'

export function ResultOverview() {
  const { result, goTo } = useApp()
  if (!result) return null

  const today = new Date(result.asOf).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <Backdrop image={backdropFor('result')}>
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Wordmark />
          <span className="font-mono text-[11.5px] text-[var(--color-muted)] tabular">{today}</span>
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Your Market Value</p>
        <p className="mt-2 font-display text-[46px] font-medium leading-none tabular">
          <span className="text-[var(--color-accent-blue)]">₹</span>
          {result.marketValueLPA.toFixed(1)} <span className="text-[24px] font-sans font-semibold text-[var(--color-muted)]">LPA</span>
        </p>

        <div className="mt-4 flex items-baseline gap-2 font-mono text-[14px] text-[var(--color-muted)] tabular">
          <span>₹{result.lowerRangeLPA.toFixed(1)}L</span>
          <span className="h-px flex-1 bg-[var(--color-line-strong)]" />
          <span>₹{result.upperRangeLPA.toFixed(1)}L</span>
        </div>
        <p className="mt-1 text-[11.5px] text-[var(--color-muted)]">Estimated Range</p>

        <div className="mt-6">
          <StatRow>
            <StatTile label="Market Score" value={`${result.score}/100`} />
            <StatTile label="Market Position" value={`Top ${result.percentileTopPercent}%`} />
            <StatTile label="Confidence" value={<ConfidenceBadge confidence={result.confidence} />} />
          </StatRow>
        </div>

        <p className="mt-6 text-[11.5px] leading-relaxed text-[var(--color-muted)]">
          Estimated and modeled from your profile signals — indicative, not a guaranteed salary or offer.
        </p>
      </div>

      <div className="shrink-0 border-t border-[var(--color-line)] px-6 pt-4 pb-3">
        <Button variant="accent" className="w-full" onClick={() => goTo('why')}>
          <span className="flex w-full items-center justify-between">
            View Detailed Analysis
            <IconArrowRight className="h-4 w-4" />
          </span>
        </Button>
        <div className="mt-2.5 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
