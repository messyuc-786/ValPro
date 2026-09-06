import { useApp } from '../state/AppContext'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { IconArrowRight, IconChevronLeft } from '../ui/icons'
import { backdropFor } from '../navigation/flow'

/**
 * "How It Works" — the product mechanics only: the journey a profile takes
 * through the app, and the two rules that keep it honest (optional fields,
 * insufficient-evidence instead of a fabricated number). Deliberately
 * contains none of the creator/origin story (see CreatorStory.tsx) — this
 * page explains the product, not why it was built.
 */
const STEPS = [
  { label: 'Profile', detail: 'You share your education, experience, skills, certifications, achievements and location.' },
  { label: 'Domain / Context', detail: 'You pick the professional domain that matches your work — from Technology to Legal to Fresher/Student.' },
  { label: 'Market Evidence', detail: 'ValPro checks whether it has a calibrated benchmark model for that domain.' },
  { label: 'Valuation', detail: 'If evidence exists, your profile signals are weighted against that domain’s model to produce a value range.' },
  { label: 'Explanation', detail: 'Every result comes with the specific factors behind it — strengths, gaps, and what moved the number.' },
  { label: 'What-If', detail: 'You can simulate realistic changes (a certification, a new skill, a role change) and see the modeled impact before acting on it.' },
  { label: 'A Better Decision', detail: 'You walk into your next negotiation, appraisal or job switch with an explainable number, not a guess.' },
]

export function HowItWorks() {
  const { goBack, goTo } = useApp()

  return (
    <Backdrop image={backdropFor('howItWorks')}>
      <div className="flex h-full min-h-full flex-col px-6 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Wordmark />
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-[var(--color-line-strong)]"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">How It Works</p>
          <p className="mt-3 font-display text-[22px] leading-snug">From your profile to a decision you can act on.</p>

          <div className="mt-7 flex flex-col gap-5">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex gap-3.5">
                <span className="font-mono text-[13px] font-semibold text-[var(--color-accent-blue)] tabular">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 border-b border-[var(--color-line)] pb-4">
                  <p className="text-[14.5px] font-semibold text-[var(--color-text)]">{step.label}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-4">
            <div>
              <p className="text-[13px] font-semibold text-[var(--color-text)]">Certifications and achievements are optional.</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
                Wherever ValPro asks for them, "None" / "Not Applicable" is a valid, complete answer — you're never blocked
                for not having one.
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--color-text)]">No verified evidence, no invented number.</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
                If ValPro doesn't yet have a calibrated market model for your domain, it tells you that directly —
                "Insufficient Market Evidence" — instead of showing a value it can't stand behind.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start gap-2.5 border-t border-[var(--color-line)] pt-5">
            <button
              type="button"
              onClick={() => goTo('creators')}
              className="inline-flex items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
            >
              Why ValPro Exists <IconArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => goTo('faq')}
              className="inline-flex items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
            >
              Read the FAQ <IconArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
