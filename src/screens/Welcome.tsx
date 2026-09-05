import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { IconArrowRight, IconClose } from '../ui/icons'

const STATS = [
  { value: '4+', label: 'Career Domains' },
  { value: '1M+', label: 'Professionals' },
  { value: '95%', label: 'Find it useful' },
]

export function Welcome() {
  const { goTo } = useApp()
  const [storyOpen, setStoryOpen] = useState(false)

  return (
    <div className="theme-dark relative flex h-full min-h-full flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-10">
        <div>
          <span className="font-display text-[20px] font-semibold tracking-tight">ValPro</span>

          <h1 className="mt-10 font-display text-[38px] font-medium leading-[1.08]">
            Know your <em className="not-italic text-[var(--color-accent)]">market value.</em>
          </h1>
          <p className="mt-4 max-w-[30ch] text-[15px] leading-relaxed text-[var(--color-muted)]">
            Not just your salary. Real insights for a stronger next step.
          </p>

          <button
            type="button"
            onClick={() => setStoryOpen(true)}
            className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--color-accent)]"
          >
            Why ValPro Exists <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          <Button onClick={() => goTo('role')} className="w-full">
            <span className="flex w-full items-center justify-between">
              Discover Your Market Value
              <IconArrowRight className="h-4 w-4" />
            </span>
          </Button>

          <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-5">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-[16px] font-semibold tabular">{s.value}</span>
                <span className="text-[10.5px] text-[var(--color-muted)]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {storyOpen && <CreatorStorySheet onClose={() => setStoryOpen(false)} onStart={() => goTo('role')} />}
    </div>
  )
}

function CreatorStorySheet({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/50" role="dialog" aria-modal="true" aria-label="Why ValPro Exists">
      <div className="theme-dark max-h-[85%] overflow-y-auto rounded-t-[10px] border-t border-[var(--color-line)] bg-[var(--color-surface)] px-6 pb-8 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-accent)]">Why ValPro Exists</span>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[var(--color-muted)]">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <p className="font-display text-[19px] leading-snug">ValPro started with a simple question:</p>
        <p className="mt-3 font-display text-[19px] italic leading-snug text-[var(--color-accent)]">
          "I cleared the interview. What CTC should I actually ask for?"
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-muted)]">
          After years of corporate experience, we saw the same uncertainty during job switches, appraisals and career changes
          across different professions.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-muted)]">The problem wasn't only knowing a salary.</p>
        <p className="mt-1 text-[14px] font-semibold leading-relaxed text-[var(--color-text)]">
          It was knowing <span className="text-[var(--color-accent)]">your value in today's market.</span>
        </p>

        <div className="mt-6 border-t border-[var(--color-line)] pt-4 text-[12.5px] text-[var(--color-muted)]">
          <p>Created by Bhasad.org</p>
          <p>Designed &amp; Programmed by Himanshu Sharma &amp; Urvashi Chandan</p>
        </div>

        <Button onClick={onStart} className="mt-6 w-full">
          Discover Your Market Value
        </Button>
      </div>
    </div>
  )
}
