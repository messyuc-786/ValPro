import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext'
import { IconCheck, IconRing } from '../ui/icons'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'

const STEPS = [
  'Profile information',
  'Education analysis',
  'Experience validation',
  'Skill demand mapping',
  'Market benchmarking',
  'Calculating your value',
]

const STEP_INTERVAL_MS = 380

/**
 * A deterministic UI sequence — it does not perform live AI/network processing.
 * The valuation itself is already computed by the engine (see AppContext); this
 * screen only paces the reveal so the transition into Screen 11 feels considered.
 */
export function Analysis() {
  const { goNext } = useApp()
  const [completed, setCompleted] = useState(0)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) {
      setCompleted(STEPS.length)
      const t = setTimeout(goNext, 400)
      return () => clearTimeout(t)
    }
    if (completed >= STEPS.length) {
      const t = setTimeout(goNext, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCompleted((c) => c + 1), STEP_INTERVAL_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, prefersReducedMotion])

  return (
    <Backdrop image="/backdrops/analysis.jpg">
      <div className="flex h-full min-h-full flex-col justify-center px-6 pb-6">
        <Wordmark />
        <h1 className="mt-6 font-display text-[26px] font-medium leading-snug">Analyzing your profile…</h1>
        <p className="mt-2 max-w-[32ch] text-[14px] text-[var(--color-muted)]">
          Our engine is processing multiple profile signals to estimate your value.
        </p>

        <div className="mt-8 flex flex-col gap-3" role="status" aria-live="polite">
          {STEPS.map((label, i) => {
            const done = i < completed
            const active = i === completed
            return (
              <div key={label} className="flex items-center gap-3">
                <span className={done ? 'text-[var(--color-positive)]' : active ? 'text-[var(--color-accent-blue)]' : 'text-[var(--color-muted)]'}>
                  {done ? <IconCheck className="h-5 w-5" /> : <IconRing className={`h-5 w-5 ${active ? 'animate-spin' : ''}`} />}
                </span>
                <span className={`text-[14.5px] ${done ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>{label}</span>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-[12px] text-[var(--color-muted)]">This may take a few moments.</p>

        <div className="mt-10 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
