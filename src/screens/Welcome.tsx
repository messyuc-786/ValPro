import { useApp } from '../state/AppContext'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { Button } from '../ui/Button'
import { IconArrowRight } from '../ui/icons'
import { backdropFor } from '../navigation/flow'

const EYEBROW_SIGNALS = ['Your Skills', 'Your Experience', 'Market Reality', 'Your Value']

const STATS = [
  { value: '4+', label: 'Career Domains' },
  { value: '1M+', label: 'Professionals', qualifier: 'Community Goal' },
  { value: '95%', label: 'Found it useful', qualifier: 'Early Users' },
  { value: 'Better', label: 'Career Decisions' },
]

export function Welcome() {
  const { goTo } = useApp()

  return (
    <Backdrop image={backdropFor('welcome')} variant="hero" blur objectPosition="center 22%">
      <div className="flex h-full min-h-full flex-col justify-between px-6 pb-7 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <Wordmark />
            <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">A Bhasad.org Product</p>
          </div>
          <div className="border-l border-[var(--color-line-strong)] pl-3 text-right text-[9.5px] font-medium uppercase leading-[1.7] tracking-[0.1em] text-[var(--color-muted)]">
            Know Today.
            <br />
            Negotiate Better.
            <br />
            Grow Further.
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {EYEBROW_SIGNALS.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="mt-3 h-px w-10 bg-[var(--color-accent-blue)]" />

          <h1 className="mt-4 font-display text-[38px] font-medium leading-[1.06]">
            Know your <br />
            <em className="not-italic text-[var(--color-accent-blue)]">market value.</em>
          </h1>
          <p className="mt-4 max-w-[28ch] text-[14.5px] leading-relaxed text-[var(--color-muted)]">
            Not just your salary. Real insights for a stronger next step.
          </p>

          <div className="mt-6">
            <Button onClick={() => goTo('role')} className="w-full">
              <span className="flex w-full items-center justify-between">
                Discover Your Market Value
                <IconArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => goTo('creators')}
            className="mt-4 inline-flex items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
          >
            Why ValPro Exists <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-[6px] border border-[var(--color-line)] bg-black/30 px-3 py-4 backdrop-blur-sm">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5 text-center">
              <span className="font-mono text-[15px] font-semibold tabular">{s.value}</span>
              <span className="text-[9px] leading-tight text-[var(--color-muted)]">{s.label}</span>
              {s.qualifier && <span className="text-[8px] italic leading-tight text-[var(--color-muted)]/70">({s.qualifier})</span>}
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="text-[10.5px] leading-snug text-[var(--color-muted)]">
            <p>Created by Bhasad.org</p>
            <p>Designed &amp; Programmed by Himanshu Sharma &amp; Urvashi Chandan</p>
          </div>
          <p className="shrink-0 font-script text-[16px] leading-none text-[var(--color-muted)]">a bigger possibility.</p>
        </div>
        <div className="mt-2 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
