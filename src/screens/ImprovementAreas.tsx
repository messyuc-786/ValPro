import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { GapCard } from '../ui/resultDisplay'
import { IconChevronLeft } from '../ui/icons'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { backdropFor } from '../navigation/flow'

export function ImprovementAreas() {
  const { result, goTo, goBack } = useApp()
  if (!result || result.marketEvidence !== 'demo') return null

  return (
    <Backdrop image={backdropFor('gaps')}>
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
        <Wordmark />
        <h1 className="mt-6 font-display text-[26px] font-medium leading-snug">Your Value Gaps</h1>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Focus on these areas to increase your market value.</p>

        <div className="mt-6 flex flex-col gap-3">
          {result.valueGaps.length === 0 ? (
            <p className="text-[13.5px] text-[var(--color-muted)]">No significant gaps detected in your current profile.</p>
          ) : (
            result.valueGaps.map((gap, i) => (
              <GapCard key={gap.id} rank={i + 1} label={gap.label} detail={gap.detail} impactLow={gap.impactLowLPA} impactHigh={gap.impactHighLPA} />
            ))
          )}
        </div>

        <p className="mt-6 text-[11.5px] leading-relaxed text-[var(--color-muted)]">
          These are modeled scenarios based on your profile — not guaranteed raises.
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
          <Button variant="accent" className="flex-1" onClick={() => goTo('whatif')}>
            What If? →
          </Button>
        </div>
        <div className="mt-2.5 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
