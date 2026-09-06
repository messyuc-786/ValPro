import { useApp } from '../state/AppContext'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { IconArrowRight, IconChevronLeft } from '../ui/icons'
import { backdropFor } from '../navigation/flow'

/**
 * "Why ValPro Exists" — a dedicated full-screen page (per the package's
 * "prefer an expandable story or dedicated page" direction) rather than a
 * modal, so it reads as an editorial piece and not an interruption.
 *
 * Scope is deliberately narrow: the creator/origin story only. The product
 * mechanics live on How It Works, and practical Q&A lives on FAQ — none of
 * the three repeats another's content (see docs comments on those screens).
 */
export function CreatorStory() {
  const { goBack, goTo } = useApp()

  return (
    <Backdrop image={backdropFor('creators')}>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">Why ValPro Exists</p>

          <p className="mt-5 font-display text-[20px] leading-snug">A simple question started it all.</p>
          <p className="mt-3 font-display text-[22px] italic leading-snug text-[var(--color-accent-blue)]">
            "I cleared the interview. What CTC should I actually ask for?"
          </p>

          <p className="mt-6 text-[14px] leading-relaxed text-[var(--color-muted)]">
            The idea for ValPro came from a very real corporate problem: knowing your current salary is not the same as
            knowing your professional market value.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-muted)]">
            After more than 11 years of corporate experience, Himanshu Sharma and Urvashi Chandan experienced and
            observed the same uncertainty around job switches, appraisals, salary negotiations and career transitions.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-muted)]">
            A person may know their CTC, education, experience and achievements, but still struggle to answer:
          </p>
          <p className="mt-2 font-display text-[17px] italic leading-snug text-[var(--color-text)]">
            "What should I actually be worth today?"
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-muted)]">
            The problem is not limited to one profession. IT professionals, bankers, teachers, freshers, managers,
            career switchers and people across domains can face the same uncertainty.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-muted)]">
            That recurring question — asked in interview rooms, appraisal cycles and career pivots — is what ValPro was
            built to answer honestly.
          </p>

          <div className="mt-8 border-t border-[var(--color-line)] pt-5">
            <p className="text-[13px] font-semibold text-[var(--color-text)]">Created by Bhasad.org</p>
            <p className="mt-1 text-[13px] text-[var(--color-muted)]">Designed &amp; Programmed by Himanshu Sharma &amp; Urvashi Chandan</p>
            <p className="mt-2 text-[12.5px] italic text-[var(--color-accent)]">Corporate Survivors. Building a Better Tomorrow.</p>
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Know Today. Negotiate Better. Grow Further.
          </p>

          <div className="mt-6 flex flex-col items-start gap-2.5 border-t border-[var(--color-line)] pt-5">
            <button
              type="button"
              onClick={() => goTo('howItWorks')}
              className="inline-flex items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
            >
              See How It Works <IconArrowRight className="h-3.5 w-3.5" />
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
