import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { ConfidenceBadge, StatRow, StatTile } from '../ui/resultDisplay'
import { IconArrowRight } from '../ui/icons'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { backdropFor } from '../navigation/flow'
import { DOMAIN_OPTIONS } from '../types/profile'

export function ResultOverview() {
  const { result, goTo, restart } = useApp()
  if (!result) return null

  const today = new Date(result.asOf).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  // No calibrated benchmark exists for this domain yet — show that honestly
  // instead of a fabricated number. The user never reaches Why/Gaps/What-If/
  // Share from here, since there is nothing computed for those to explain.
  if (result.marketEvidence === 'insufficient') {
    const domainLabel = DOMAIN_OPTIONS.find((d) => d.id === result.domainId)?.label ?? result.domainId
    const completenessPercent = Math.round(result.profileCompletenessRatio * 100)

    return (
      <Backdrop image={backdropFor('result')}>
        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <Wordmark />
            <span className="font-mono text-[11.5px] text-[var(--color-muted)] tabular">{today}</span>
          </div>

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">Market Evidence</p>
          <p className="mt-2 font-display text-[28px] font-medium leading-snug">Insufficient data for {domainLabel}</p>
          <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-muted)]">{result.reason} Rather than guess, ValPro says so honestly instead of showing an invented number.</p>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">What's Missing</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {result.missingEvidence.map((item) => (
              <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-[var(--color-muted)]">
                <span aria-hidden="true" className="text-[var(--color-accent)]">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">What You Can Do</p>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-muted)]">{result.suggestedAction}</p>

          <p className="mt-6 text-[11.5px] text-[var(--color-muted)]">
            Your profile is <span className="font-semibold text-[var(--color-text)]">{completenessPercent}% complete</span> — that
            work isn't lost; it's ready the moment {domainLabel.toLowerCase()} has verified data.
          </p>
        </div>

        <div className="shrink-0 border-t border-[var(--color-line)] px-6 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => goTo('domain')}>
              Change Domain
            </Button>
            <Button variant="accent" className="flex-1" onClick={restart}>
              Start Over
            </Button>
          </div>
          <div className="mt-2.5 flex justify-center">
            <FooterMark />
          </div>
        </div>
      </Backdrop>
    )
  }

  return (
    <Backdrop image={backdropFor('result')}>
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
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

      <div className="shrink-0 border-t border-[var(--color-line)] px-6 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-4">
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
