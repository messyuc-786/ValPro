import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { ScenarioRow } from '../ui/resultDisplay'
import { IconChevronLeft } from '../ui/icons'

export function WhatIfSimulator() {
  const { result, goTo, goBack } = useApp()
  if (!result) return null

  return (
    <div className="theme-dark flex h-full min-h-full flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4">
        <span className="font-display text-[17px] font-semibold">ValPro</span>
        <h1 className="mt-6 font-display text-[26px] font-medium leading-snug">What if?</h1>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">See how changes could impact your value.</p>

        <div className="mt-6 flex flex-col gap-3">
          {result.scenarios.map((s) => (
            <ScenarioRow key={s.id} label={s.label} currentValue={s.currentValueLPA} scenarioValue={s.scenarioValueLPA} delta={s.deltaLPA} />
          ))}
        </div>

        <p className="mt-6 text-[11.5px] leading-relaxed text-[var(--color-muted)]">
          Modeled scenarios from the {result.domainId} domain pack — not promises of a raise or offer.
        </p>
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
          <Button variant="accent" className="flex-1" onClick={() => goTo('share')}>
            Share Result →
          </Button>
        </div>
      </div>
    </div>
  )
}
