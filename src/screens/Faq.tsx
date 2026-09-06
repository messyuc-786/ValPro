import { useApp } from '../state/AppContext'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { IconArrowRight, IconChevronLeft } from '../ui/icons'
import { backdropFor } from '../navigation/flow'

/**
 * FAQ — practical questions and objections a user actually has before or
 * while using ValPro. Deliberately contains none of the creator/origin
 * story (see CreatorStory.tsx) and none of the step-by-step mechanics (see
 * HowItWorks.tsx) — each answer here is short and specific to one concern.
 */
const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'What is ValPro?', a: 'A tool that estimates your current professional market value from your real profile — education, experience, skills and more — and explains why, rather than just asking your current salary.' },
  { q: 'Is it a salary calculator?', a: 'No. A salary calculator reflects what you already earn. ValPro estimates what the market would value you at today, which can be higher, lower, or the same as your current pay.' },
  { q: 'Does it guarantee a salary or offer?', a: 'No. Every result is a modeled estimate with a stated confidence level — indicative, not a promise of compensation from any employer.' },
  { q: 'How is market value determined?', a: 'Your profile signals are weighted against a domain-specific benchmark model — see How It Works for the exact steps and factors.' },
  { q: 'What happens if there isn’t enough data for my domain?', a: 'ValPro says so directly — "Insufficient Market Evidence" — instead of showing a number it can’t stand behind. Your profile is saved for when real data is added.' },
  { q: 'Are certifications mandatory?', a: 'No. Certifications are optional and never block you from getting a result.' },
  { q: 'What if I have no achievements?', a: 'That’s fine — achievements are optional too. You can move on without adding any.' },
  { q: 'Can students use it?', a: 'Yes. Fresher / Student is a dedicated domain designed around education and early signals rather than years of experience.' },
  { q: 'Is it only for IT professionals?', a: 'No. ValPro covers a broad range of domains — Banking, Education, Healthcare, Legal, Marketing, Sales and more — alongside Technology.' },
  { q: 'Can the result help with a negotiation?', a: 'Yes — the explanation behind your value, and the specific gaps and What-If scenarios, are meant to be evidence you can actually use in a conversation.' },
  { q: 'What happens to my data?', a: 'Your profile is stored locally in your browser to power your result — it isn’t sent to or stored on a ValPro server.' },
  { q: 'Who created ValPro?', a: 'Bhasad.org. See "Why ValPro Exists" for the full story of how and why it was built.' },
]

export function Faq() {
  const { goBack, goTo } = useApp()

  return (
    <Backdrop image={backdropFor('faq')}>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">FAQ</p>
          <p className="mt-3 font-display text-[22px] leading-snug">Questions people actually ask.</p>

          <div className="mt-7 flex flex-col">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="border-b border-[var(--color-line)] py-4 first:pt-0">
                <p className="text-[14px] font-semibold text-[var(--color-text)]">{item.q}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-muted)]">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start gap-2.5">
            <button
              type="button"
              onClick={() => goTo('creators')}
              className="inline-flex items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
            >
              Why ValPro Exists <IconArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => goTo('howItWorks')}
              className="inline-flex items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
            >
              See How It Works <IconArrowRight className="h-3.5 w-3.5" />
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
