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
  { label: 'FAQ', target: 'creators' as const },
]

export function Welcome() {
  const { goTo } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Backdrop
      image={backdropFor('welcome')}
      variant="hero"
      objectPositionClassName="object-[center_30%]"
      blurClassName="scale-110 blur-md"
    >
      <div className="flex h-full min-h-full flex-col px-5 pb-5 pt-5">
        {/* Nav */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <Wordmark markClassName="h-5 w-5" />
            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">A Bhasad.org Product</p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2.5 text-[9.5px] font-medium text-[var(--color-text)]/95">
              {NAV_LINKS.map((link) => (
                <button key={link.label} type="button" onClick={() => goTo(link.target)} className="hover:text-[var(--color-accent-blue)]">
                  {link.label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-text)]"
            >
              {menuOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-2 flex flex-col gap-1 self-end rounded-[6px] border border-[var(--color-line-strong)] bg-black/70 px-4 py-3 text-right backdrop-blur-sm">
            {NAV_LINKS.map((link) => (
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
        <div className="relative mt-5">
          <div className="max-w-[68%]">
            <div className="flex flex-col gap-0.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {EYEBROW_SIGNALS.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="mt-2 h-px w-8 bg-[var(--color-accent-blue)]" />

            <h1 className="mt-3 font-display text-[30px] font-medium leading-[1.05]">
              Know your <br />
              <em className="not-italic text-[var(--color-accent-blue)]">market value.</em>
            </h1>
            <p className="mt-2.5 max-w-[26ch] text-[12.5px] leading-relaxed text-[var(--color-muted)]">
              Not just your salary. Real insights for a stronger next step.
            </p>
          </div>

          {/* Editorial annotation, floated beside the hero next to the skyline */}
          <div className="absolute right-0 top-1 max-w-[30%] border-l border-[var(--color-line-strong)] pl-2.5 text-right text-[8px] font-medium uppercase leading-[1.7] tracking-[0.1em] text-[var(--color-muted)]">
            Same Talent.
            <br />
            Different Opportunities.
            <br />
            Know the Difference.
          </div>
        </div>

        <div className="mt-4 max-w-[80%]">
          <Button onClick={() => goTo('role')} className="w-full py-3 text-[13.5px]">
            <span className="flex w-full items-center justify-between">
              Discover Your Market Value
              <IconArrowRight className="h-3.5 w-3.5" />
            </span>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => goTo('creators')}
          className="mt-3 inline-flex w-fit items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[11.5px] font-semibold text-[var(--color-accent)]"
        >
          Why ValPro Exists <IconArrowRight className="h-3 w-3" />
        </button>

        <div className="flex-1" />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5 rounded-[6px] border border-[var(--color-line)] bg-black/25 px-2.5 py-3 backdrop-blur-[2px]">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
              <s.icon className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              <span className="font-mono text-[12.5px] font-semibold tabular">{s.value}</span>
              <span className="text-[7px] leading-tight text-[var(--color-muted)]">{s.label}</span>
              {s.qualifier && <span className="text-[6.5px] italic leading-tight text-[var(--color-muted)]/70">({s.qualifier})</span>}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[9px] text-[var(--color-muted)]">
            Powered by <span className="font-semibold text-[var(--color-text)]">Bhasad.org</span>
          </p>
          <p className="text-[8px] text-[var(--color-muted)]/70">© 2026 Bhasad.org. All rights reserved.</p>
          <p className="shrink-0 font-script text-[13px] leading-none text-[var(--color-muted)]">a bigger possibility.</p>
        </div>
      </div>
    </Backdrop>
  )
}
