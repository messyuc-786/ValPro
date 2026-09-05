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

function NavMenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-text)]"
    >
      {open ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
    </button>
  )
}

function StatsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid grid-cols-4 rounded-[6px] border border-[var(--color-line)] bg-black/25 backdrop-blur-[2px] ${
        compact ? 'gap-1.5 px-2.5 py-3' : 'gap-4 px-8 py-6'
      }`}
    >
      {STATS.map((s) => (
        <div key={s.label} className={`flex flex-col items-center gap-1 text-center ${compact ? '' : 'gap-2'}`}>
          <s.icon className={compact ? 'h-3.5 w-3.5 text-[var(--color-accent)]' : 'h-5 w-5 text-[var(--color-accent)]'} />
          <span className={`font-mono font-semibold tabular ${compact ? 'text-[12.5px]' : 'text-[20px]'}`}>{s.value}</span>
          <span className={`leading-tight text-[var(--color-muted)] ${compact ? 'text-[7px]' : 'text-[12.5px]'}`}>{s.label}</span>
          {s.qualifier && (
            <span className={`italic leading-tight text-[var(--color-muted)]/70 ${compact ? 'text-[6.5px]' : 'text-[10.5px]'}`}>({s.qualifier})</span>
          )}
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
      <p className={`shrink-0 font-script leading-none text-[var(--color-muted)] ${compact ? 'text-[13px]' : 'text-[19px]'}`}>a bigger possibility.</p>
    </div>
  )
}

export function Welcome() {
  const { goTo } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative w-full bg-[var(--color-bg,#0e1116)] text-[var(--color-text,#f3f1ea)]">
      {/* ============ MOBILE / TABLET-PORTRAIT (<lg): full-bleed backdrop card ============ */}
      <div className="lg:hidden">
        <Backdrop
          image={backdropFor('welcome')}
          variant="hero"
          objectPositionClassName="object-[center_30%]"
          blurClassName="scale-110 blur-md"
          className="min-h-[100dvh]"
        >
          <div className="flex h-full min-h-full flex-col px-5 pb-5 pt-5">
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

            <StatsPanel compact />
            <div className="mt-3">
              <SiteFooter compact />
            </div>
          </div>
        </Backdrop>
      </div>

      {/* ============ DESKTOP / TABLET-LANDSCAPE (lg+): full-bleed section, bounded photo panel ============ */}
      <div className="hidden lg:flex lg:min-h-screen lg:flex-col">
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-12 py-9 xl:px-20">
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

          {/* Hero: text column + bounded photo panel */}
          <div className="mt-10 flex flex-1 items-center gap-14 xl:gap-20">
            <div className="flex w-full max-w-xl flex-col">
              <div className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {EYEBROW_SIGNALS.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="mt-3 h-px w-10 bg-[var(--color-accent-blue)]" />

              <h1 className="mt-5 font-display text-[52px] font-medium leading-[1.05] xl:text-[60px]">
                Know your <br />
                <em className="not-italic text-[var(--color-accent-blue)]">market value.</em>
              </h1>
              <p className="mt-5 max-w-[34ch] text-[16px] leading-relaxed text-[var(--color-muted)]">
                Not just your salary. Real insights for a stronger next step.
              </p>

              <div className="mt-8 max-w-sm">
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
                className="mt-5 inline-flex w-fit items-center gap-1.5 border-b border-[var(--color-accent)] pb-0.5 text-[13px] font-semibold text-[var(--color-accent)]"
              >
                Why ValPro Exists <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bounded photo panel — kept close to the source photo's own aspect ratio
                rather than stretched to fill the remaining width, which is what actually
                destroys a portrait photo's detail (forces an extreme crop/zoom). This
                reads as a deliberate framed photograph, not a rescued full-bleed image. */}
            <div className="relative hidden h-[560px] w-[40%] shrink-0 self-stretch overflow-hidden rounded-[10px] border border-[var(--color-line)] md:block">
              <img
                src={backdropFor('welcome')}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover object-[center_32%] blur-md"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(8,11,15,.9) 0%, rgba(8,11,15,.8) 32%, rgba(8,11,15,.62) 58%, rgba(8,11,15,.45) 75%, rgba(8,11,15,.78) 100%)',
                }}
              />
              <div className="absolute right-5 top-5 max-w-[65%] border-l border-white/25 pl-3 text-right text-[10px] font-medium uppercase leading-[1.8] tracking-[0.12em] text-white/85">
                Same Talent.
                <br />
                Different Opportunities.
                <br />
                Know the Difference.
              </div>
            </div>
          </div>

          <div className="mt-12">
            <StatsPanel />
          </div>
          <div className="mt-8">
            <SiteFooter />
          </div>
        </div>
      </div>
    </div>
  )
}
