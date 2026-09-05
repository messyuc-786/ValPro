import { useApp } from '../state/AppContext'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { IconChevronLeft } from '../ui/icons'
import { backdropFor } from '../navigation/flow'

/**
 * "Why ValPro Exists" — a dedicated full-screen page (per the package's
 * "prefer an expandable story or dedicated page" direction) rather than a
 * modal, so it reads as an editorial piece and not an interruption.
 */
export function CreatorStory() {
  const { goBack } = useApp()

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
            ValPro was conceived to help people understand their professional market position using relevant profile
            signals such as education, experience, skills, certifications, achievements, location, domain and market
            relevance.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-muted)]">
            ValPro provides an informed market-value estimate and explains the factors behind it — it does not present
            a modeled estimate as a guaranteed salary or promise of compensation.
          </p>

          <div className="mt-8 border-t border-[var(--color-line)] pt-5">
            <p className="text-[13px] font-semibold text-[var(--color-text)]">Created by Bhasad.org</p>
            <p className="mt-1 text-[13px] text-[var(--color-muted)]">Designed &amp; Programmed by Himanshu Sharma &amp; Urvashi Chandan</p>
            <p className="mt-2 text-[12.5px] italic text-[var(--color-accent)]">Corporate Survivors. Building a Better Tomorrow.</p>
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Know Today. Negotiate Better. Grow Further.
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
