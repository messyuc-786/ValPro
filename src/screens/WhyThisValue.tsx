import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { SignalRow } from '../ui/resultDisplay'
import { IconChevronLeft } from '../ui/icons'

export function WhyThisValue() {
  const { result, goTo, goBack } = useApp()
  if (!result) return null

  return (
    <div className="theme-dark flex h-full min-h-full flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4">
        <span className="font-display text-[17px] font-semibold">ValPro</span>
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

      <div className="shrink-0 border-t border-[var(--color-line)] px-6 py-4">
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
      </div>
    </div>
  )
}
