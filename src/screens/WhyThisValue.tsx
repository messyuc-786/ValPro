import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { SignalRow } from '../ui/resultDisplay'
import { IconChevronLeft } from '../ui/icons'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { backdropFor } from '../navigation/flow'

export function WhyThisValue() {
  const { result, goTo, goBack } = useApp()
  if (!result) return null

  return (
    <Backdrop image={backdropFor('why')}>
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
        <Wordmark />
        <h1 className="mt-6 font-display text-[26px] font-medium leading-snug">Why this value?</h1>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Key factors that influence your market value.</p>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-positive)]">Positive Signals</p>
        <div className="mt-2 flex flex-col divide-y divide-[var(--color-line)]">
          {result.positiveSignals.length === 0 ? (
            <p className="py-2 text-[13.5px] text-[var(--color-muted)]">Add more profile detail to surface positive signals.</p>
          ) : (
            result.positiveSignals.map((s) => <SignalRow key={s.id} label={s.label} positive />)
          )}
        </div>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-negative)]">Areas to Improve</p>
        <div className="mt-2 flex flex-col divide-y divide-[var(--color-line)]">
          {result.improvementSignals.map((s) => (
            <SignalRow key={s.id} label={s.label} positive={false} />
          ))}
        </div>
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
          <Button variant="accent" className="flex-1" onClick={() => goTo('gaps')}>
            See Value Gaps →
          </Button>
        </div>
        <div className="mt-2.5 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
