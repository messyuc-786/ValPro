import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { Backdrop } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { Button } from '../ui/Button'
import { IconArrowRight, IconBriefcase, IconCheck, IconClose, IconMenu, IconSearch, IconTarget } from '../ui/icons'
import { backdropFor } from '../navigation/flow'

const EYEBROW_SIGNALS = ['Your Skills', 'Your Experience', 'Market Reality', 'Your Value']

// Truthful product descriptors — no invented user counts, satisfaction
// percentages, or adoption claims. Every one of these is something the
// product actually does, not a measured/marketed statistic.
const VALUE_POINTS = [
  { label: 'Multiple Career Paths', icon: IconBriefcase },
  { label: 'Profile-Based Valuation', icon: IconCheck },
  { label: 'Market-Aware Insights', icon: IconSearch },
  { label: 'Built for Better Decisions', icon: IconTarget },
]

// "About" and "How it Works" both point at the one substantive page this
// product actually has today (the creator story) — real navigation to real
// content, not decorative dead links reserved for pages that don't exist yet.
const NAV_LINKS = [
  { label: 'About', target: 'creators' as const },
  { label: 'How it Works', target: 'creators' as const },
  { label: 'FAQ', target: 'creators' as const },
]

function NavMenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      // 44px — the minimum comfortable touch target (iOS HIG / Material both
      // land here); the earlier 36px was sized for a mouse cursor, not a thumb.
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-text)]"
    >
      {open ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
    </button>
  )
}

function ValuePointsRow({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 ${compact ? 'gap-3' : 'gap-6'}`}>
      {VALUE_POINTS.map((v) => (
        <div key={v.label} className={`flex items-center text-left ${compact ? 'gap-2' : 'gap-3'}`}>
          <v.icon className={`shrink-0 text-[var(--color-accent)] ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <span className={`leading-tight text-[var(--color-muted)] ${compact ? 'text-[10.5px]' : 'text-[13.5px]'}`}>{v.label}</span>
        </div>
      ))}
    </div>
  )
}

function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${compact ? '' : 'gap-4'}`}>
      <p className={compact ? 'text-[9px] text-[var(--color-muted)]' : 'text-[13px] text-[var(--color-muted)]'}>
        Powered by <span className="font-semibold text-[var(--color-text)]">Bhasad.org</span>
      </p>
      <p className={compact ? 'text-[8px] text-[var(--color-muted)]/70' : 'text-[12px] text-[var(--color-muted)]/70'}>
        © 2026 Bhasad.org. All rights reserved.
      </p>
    </div>
  )
}

export function Welcome() {
  const { goTo } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="theme-dark relative w-full bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* ============ MOBILE / TABLET-PORTRAIT (<lg): full-bleed backdrop card ============ */}
      <div className="lg:hidden">
        <Backdrop image={backdropFor('welcome')} variant="hero" objectPositionClassName="object-[center_28%]" className="min-h-[100dvh]">
          <div className="flex h-full min-h-full flex-col px-5 pb-[calc(1.25rem_+_env(safe-area-inset-bottom))] pt-[calc(1.25rem_+_env(safe-area-inset-top))]">
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
                <NavMenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
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

            <div className="mt-5">
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

            <div className="rounded-[6px] border border-[var(--color-line)] bg-black/25 px-3 py-3.5">
              <ValuePointsRow compact />
            </div>
            <div className="mt-3">
              <SiteFooter compact />
            </div>
          </div>
        </Backdrop>
      </div>

      {/* ============ DESKTOP / TABLET-LANDSCAPE (lg+): full-bleed photographic hero band ============ */}
      <div className="hidden lg:block">
        {/* Hero band — the photograph is the whole composition here, not a side
            panel. Height is capped well below the viewport height (not 100vh)
            specifically so `object-cover` doesn't have to zoom into a small,
            distorted sliver of this portrait-shaped source photo — see
            Backdrop.tsx's `heroBand` scrim comment for the underlying math. */}
        <Backdrop
          image={backdropFor('welcome')}
          variant="heroBand"
          objectPositionClassName="object-[center_100%]"
          className="h-[min(46vw,640px)] min-h-[520px]"
        >
          <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col px-12 py-8 xl:px-20">
            {/* Nav */}
            <div className="flex items-center justify-between">
              <div>
                <Wordmark markClassName="h-7 w-7" className="gap-2.5" />
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">A Bhasad.org Product</p>
              </div>
              <div className="flex items-center gap-8">
                <nav className="flex items-center gap-7 text-[13px] font-medium text-[var(--color-text)]/90">
                  {NAV_LINKS.map((link) => (
                    <button key={link.label} type="button" onClick={() => goTo(link.target)} className="hover:text-[var(--color-accent-blue)]">
                      {link.label}
                    </button>
                  ))}
                </nav>
                <NavMenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
              </div>
            </div>

            {menuOpen && (
              <div className="mt-3 flex flex-col gap-1 self-end rounded-[6px] border border-[var(--color-line-strong)] bg-black/70 px-5 py-3 text-right backdrop-blur-sm">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      goTo(link.target)
                    }}
                    className="py-1 text-[14px] font-medium text-[var(--color-text)] hover:text-[var(--color-accent-blue)]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}

            {/* Hero copy — overlaid directly on the photograph, left-aligned,
                over the darker upper band of the scrim. */}
            <div className="flex flex-1 flex-col justify-center">
              <div className="flex max-w-xl flex-col">
                <div className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {EYEBROW_SIGNALS.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="mt-3 h-px w-10 bg-[var(--color-accent-blue)]" />

                <h1 className="mt-4 font-display text-[44px] font-medium leading-[1.05] xl:text-[52px]">
                  Know your <br />
                  <em className="not-italic text-[var(--color-accent-blue)]">market value.</em>
                </h1>
                <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-[var(--color-muted)]">
                  Not just your salary. Real insights for a stronger next step.
                </p>

                <div className="mt-6 max-w-sm">
                  <Button onClick={() => goTo('role')} className="w-full py-3.5 text-[15px]">
                    <span className="flex w-full items-center justify-between">
                      Discover Your Market Value
                      <IconArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => goTo('creators')}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
                >
                  Why ValPro Exists <IconArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Backdrop>

        {/* Supporting information — a distinct section below the photographic
            hero (not overlaid on the photo), per the approved composition. */}
        <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-12 py-8 xl:px-20">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
            <ValuePointsRow />
            <SiteFooter />
          </div>
        </div>
      </div>
    </div>
  )
}
