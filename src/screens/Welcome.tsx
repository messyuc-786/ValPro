import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { Backdrop } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { Button } from '../ui/Button'
import { IconArrowRight, IconBarChartUp, IconBriefcase, IconClose, IconMenu, IconTarget, IconUsers } from '../ui/icons'
import { backdropFor } from '../navigation/flow'

const EYEBROW_SIGNALS = ['Your Skills', 'Your Experience', 'Market Reality', 'Your Value']

const STATS = [
  { value: '4+', label: 'Career Domains', icon: IconBriefcase },
  { value: '1M+', label: 'Professionals', qualifier: 'Community Goal', icon: IconUsers },
  { value: '95%', label: 'Found it useful', qualifier: 'Early Users', icon: IconBarChartUp },
  { value: 'Better', label: 'Career Decisions', icon: IconTarget },
]

// "About" and "How it Works" both point at the one substantive page this
// product actually has today (the creator story) — real navigation to real
// content, not decorative dead links reserved for pages that don't exist yet.
const NAV_LINKS = [
  { label: 'About', target: 'creators' as const },
  { label: 'How it Works', target: 'creators' as const },
]

export function Welcome() {
  const { goTo } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Backdrop
      image={backdropFor('welcome')}
      variant="hero"
      objectPositionClassName="object-[center_22%] lg:object-[center_80%]"
      blurClassName="scale-110 blur-md"
      className="min-h-[100dvh]"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-between px-6 pb-7 pt-6 lg:justify-start lg:px-16 lg:pb-12 lg:pt-8">
        {/* Nav */}
        <div className="flex items-start justify-between">
          <div>
            <Wordmark markClassName="h-6 w-6 lg:h-7 lg:w-7" className="lg:gap-2.5" />
            <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] lg:text-[10px]">
              A Bhasad.org Product
            </p>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden items-center gap-7 text-[12.5px] font-medium text-[var(--color-text)]/90 lg:flex">
              {NAV_LINKS.map((link) => (
                <button key={link.label} type="button" onClick={() => goTo(link.target)} className="hover:text-[var(--color-accent-blue)]">
                  {link.label}
                </button>
              ))}
              <button type="button" onClick={() => goTo('creators')} className="hover:text-[var(--color-accent-blue)]">
                FAQ
              </button>
            </nav>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-text)]"
            >
              {menuOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-3 flex flex-col gap-1 self-end rounded-[6px] border border-[var(--color-line-strong)] bg-black/70 px-4 py-3 text-right backdrop-blur-sm">
            {[...NAV_LINKS, { label: 'FAQ', target: 'creators' as const }].map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  goTo(link.target)
                }}
                className="py-1 text-[13px] font-medium text-[var(--color-text)] hover:text-[var(--color-accent-blue)]"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Hero */}
        <div className="relative mt-8 flex-1 lg:mt-16 lg:flex-none">
          <div className="lg:max-w-[46%]">
            <div className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] lg:text-[11px]">
              {EYEBROW_SIGNALS.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="mt-3 h-px w-10 bg-[var(--color-accent-blue)]" />

            <h1 className="mt-4 font-display text-[38px] font-medium leading-[1.06] lg:text-[58px]">
              Know your <br />
              <em className="not-italic text-[var(--color-accent-blue)]">market value.</em>
            </h1>
            <p className="mt-4 max-w-[28ch] text-[14.5px] leading-relaxed text-[var(--color-muted)] lg:text-[16px]">
              Not just your salary. Real insights for a stronger next step.
            </p>

            <div className="mt-6 lg:mt-8 lg:max-w-sm">
              <Button onClick={() => goTo('role')} className="w-full lg:py-4 lg:text-[16px]">
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

          {/* Editorial annotation — desktop only, floats over the photo beside the headline */}
          <div className="hidden lg:absolute lg:right-0 lg:top-2 lg:block lg:max-w-[15ch] lg:border-l lg:border-[var(--color-line-strong)] lg:pl-4 lg:text-right lg:text-[11px] lg:font-medium lg:uppercase lg:leading-[1.85] lg:tracking-[0.12em] lg:text-[var(--color-muted)]">
            Same Talent.
            <br />
            Different Opportunities.
            <br />
            Know the Difference.
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-[6px] border border-[var(--color-line)] bg-black/30 px-3 py-4 backdrop-blur-sm lg:mt-14 lg:grid-cols-4 lg:gap-6 lg:px-8 lg:py-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 text-center lg:items-start lg:text-left">
              <s.icon className="h-4 w-4 text-[var(--color-accent)] lg:h-5 lg:w-5" />
              <span className="font-mono text-[15px] font-semibold tabular lg:text-[20px]">{s.value}</span>
              <span className="text-[9px] leading-tight text-[var(--color-muted)] lg:text-[12px]">{s.label}</span>
              {s.qualifier && <span className="text-[8px] italic leading-tight text-[var(--color-muted)]/70 lg:text-[10.5px]">({s.qualifier})</span>}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 lg:mt-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10.5px] text-[var(--color-muted)] lg:text-[12px]">
              Powered by <span className="font-semibold text-[var(--color-text)]">Bhasad.org</span>
            </p>
            <p className="hidden shrink-0 font-script text-[16px] leading-none text-[var(--color-muted)] lg:block lg:text-[19px]">
              A bigger possibility.
            </p>
          </div>
          <p className="mt-1.5 text-center text-[9.5px] text-[var(--color-muted)]/70 lg:mt-1 lg:text-left lg:text-[11px]">
            © 2026 Bhasad.org. All rights reserved.
          </p>
          <p className="mt-1.5 text-center font-script text-[15px] leading-none text-[var(--color-muted)] lg:hidden">A bigger possibility.</p>
        </div>
      </div>
    </Backdrop>
  )
}
