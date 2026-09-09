import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { Wordmark } from '../ui/Logo'
import { Button } from '../ui/Button'
import { IconArrowRight, IconBriefcase, IconCheck, IconClose, IconMenu, IconSearch, IconTarget } from '../ui/icons'

const EYEBROW_SIGNALS = ['Your Skills', 'Your Experience', 'Market Reality', 'Your Value']

// Truthful product descriptors — no invented user counts, satisfaction
// percentages, or adoption claims. Every one of these is something the
// product actually does, not a measured/marketed statistic. The subtext
// is likewise descriptive of the product's own mechanics, not a claim
// about outcomes or data it doesn't have.
const VALUE_POINTS = [
  { label: 'Multiple Career Paths', sub: 'From fresher to leadership', icon: IconBriefcase },
  { label: 'Profile-Based Valuation', sub: 'Your unique journey matters', icon: IconCheck },
  { label: 'Market-Aware Insights', sub: 'Based on real market trends', icon: IconSearch },
  { label: 'Built for Better Decisions', sub: 'Plan. Upskill. Grow.', icon: IconTarget },
]

// Each nav link now routes to its own distinct screen — About (the creator
// story), How it Works (product mechanics), and FAQ (practical Q&A) no
// longer all point at the same page. See those screens' own doc comments
// for why none of the three repeats another's content.
const NAV_LINKS = [
  { label: 'About', target: 'creators' as const },
  { label: 'How it Works', target: 'howItWorks' as const },
  { label: 'FAQ', target: 'faq' as const },
]

/** Restrained account entry point — a text link either way, never a button
 * competing visually with the primary CTA. Signed-in state shows the
 * username stored at signup (see authService.signUp's user metadata), not
 * the email — email is never the public identity (see
 * docs/VALPRO_PHASE_4_REPORT.md). Rendered even when no Supabase project is
 * configured: tapping "Sign In" then honestly explains accounts aren't
 * available yet (AuthShell.tsx) rather than hiding the entry point, which
 * would look like an even less finished feature. */
function AccountEntry({ compact = false }: { compact?: boolean }) {
  const { session, signOutUser, goTo } = useApp()
  const size = compact ? 'text-[9.5px]' : 'text-[13px]'

  if (session) {
    const username = typeof session.user.user_metadata?.username === 'string' ? session.user.user_metadata.username : 'Account'
    return (
      <div className={`flex items-center gap-2 ${size} font-medium`}>
        <button type="button" onClick={() => goTo('account')} className="text-[var(--color-text)]/90 hover:text-[var(--color-accent-blue)]">
          {username}
        </button>
        <button type="button" onClick={() => signOutUser()} className="text-[var(--color-muted)] hover:text-[var(--color-accent-blue)]">
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button type="button" onClick={() => goTo('signIn')} className={`${size} font-medium text-[var(--color-text)]/90 hover:text-[var(--color-accent-blue)]`}>
      Sign In
    </button>
  )
}

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
        <div key={v.label} className={`flex items-start text-left ${compact ? 'gap-2' : 'gap-3'}`}>
          <v.icon className={`mt-0.5 shrink-0 text-[var(--color-accent)] ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <div className="leading-tight">
            <p className={`font-semibold text-[var(--color-text)] ${compact ? 'text-[10.5px]' : 'text-[13.5px]'}`}>{v.label}</p>
            {!compact && <p className="mt-0.5 text-[11.5px] text-[var(--color-muted)]">{v.sub}</p>}
          </div>
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

/** Shared eyebrow + headline + copy + CTA block — identical content on both
 * layouts, just re-typeset per breakpoint via the `compact` flag. Keeping
 * one source of this copy (rather than two near-duplicate JSX blocks)
 * means the approved wording can't quietly drift between mobile and desktop. */
function HeroCopy({ compact = false, onDiscover, onWhy }: { compact?: boolean; onDiscover: () => void; onWhy: () => void }) {
  return (
    <div className={compact ? '' : 'max-w-xl'}>
      <div
        className={`flex flex-col gap-0.5 font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ${
          compact ? 'text-[8.5px]' : 'text-[9px] tracking-[0.12em] lg:text-[11px] lg:tracking-[0.16em]'
        }`}
      >
        {EYEBROW_SIGNALS.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <div className={`bg-[var(--color-accent-blue)] ${compact ? 'mt-2 h-px w-8' : 'mt-2 h-px w-8 lg:mt-3 lg:w-10'}`} />
      {/* Sized down at md (768–1023px) specifically — the left column there
          is ~34% of a narrower container, and the desktop 44px size wrapped
          badly (found during QA against a real unmaximized browser window,
          which lands in exactly this range). */}
      <h1
        className={`font-display font-medium leading-[1.05] ${compact ? 'mt-3 text-[30px]' : 'mt-3 text-[26px] lg:mt-4 lg:text-[38px] xl:text-[44px] 2xl:text-[52px]'}`}
      >
        Know your <br />
        <em className="not-italic text-[var(--color-accent-blue)]">market value.</em>
      </h1>
      <p
        className={`leading-relaxed text-[var(--color-muted)] ${
          compact ? 'mt-2.5 max-w-[26ch] text-[12.5px]' : 'mt-2.5 max-w-[28ch] text-[12.5px] lg:mt-4 lg:max-w-[34ch] lg:text-[15px]'
        }`}
      >
        Not just your salary. Real insights for a stronger next step.
      </p>

      <div className={compact ? 'mt-4 max-w-[80%]' : 'mt-4 max-w-[85%] lg:mt-6 lg:max-w-sm'}>
        <Button onClick={onDiscover} className={compact ? 'w-full py-3 text-[13.5px]' : 'w-full py-2.5 text-[13px] lg:py-3.5 lg:text-[15px]'}>
          <span className="flex w-full items-center justify-between">
            Discover Your Market Value
            <IconArrowRight className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </span>
        </Button>
      </div>

      <button
        type="button"
        onClick={onWhy}
        className={`inline-flex w-fit items-center gap-1.5 border-b border-[var(--color-accent)] font-semibold text-[var(--color-accent)] ${
          compact ? 'mt-3 pb-0.5 text-[11.5px]' : 'mt-3 pb-0.5 text-[11.5px] lg:mt-4 lg:text-[13px]'
        }`}
      >
        Why ValPro Exists <IconArrowRight className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </button>
    </div>
  )
}

export function Welcome() {
  const { goTo } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="theme-dark relative w-full bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* ============ MOBILE (<md) ============
          Same architecture as desktop, not a different design: ONE
          full-bleed hero (background image behind everything, including
          the header) with the nav, copy and CTA layered on top via real
          HTML, then the feature strip as its own section below. No image
          card, no separate plain-background header block.
          Breakpoint is `md` (768px), not `lg` (1024px): a real but
          unmaximized desktop browser window commonly sits in the
          768–1023px range, and that reader should see the two-column
          hero, not the phone layout. */}
      <div className="relative flex w-full flex-col md:hidden">
        <div className="flex flex-col px-5 pb-4 pt-[calc(0.85rem_+_env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Wordmark markClassName="h-5 w-5" />
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">A Bhasad.org Product</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1.5">
              <nav className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1 text-[9.5px] font-medium text-[var(--color-text)]/95">
                {NAV_LINKS.map((link) => (
                  <button key={link.label} type="button" onClick={() => goTo(link.target)} className="whitespace-nowrap hover:text-[var(--color-accent-blue)]">
                    {link.label}
                  </button>
                ))}
                <span className="whitespace-nowrap">
                  <AccountEntry compact />
                </span>
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
        </div>

        {/* Full scene, nothing cropped out: the box's aspect ratio matches
            the source image's own (2000:783) exactly, so all five
            characters, their speech bubbles and the branded laptop are
            all visible and in focus — not just whoever a portrait-shaped
            crop happened to keep. Bleeds to the column's full width, no
            card or border, fading into the page at the top and bottom. */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '2000 / 783' }}>
          <img
            src={`${import.meta.env.BASE_URL}backdrops/hero-career-desktop.jpg`}
            alt="Five professionals at different career stages — fresher, working professional, career switcher, upskiller — each with a speech bubble, working together at a shared desk."
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, var(--color-bg) 0%, rgba(14,17,22,0) 16%, rgba(14,17,22,0) 78%, var(--color-bg) 100%), linear-gradient(90deg, var(--color-bg) 0%, rgba(14,17,22,0) 10%)',
            }}
          />
        </div>

        <div className="relative z-10 px-5 pb-8 pt-5">
          <HeroCopy compact onDiscover={() => goTo('role')} onWhy={() => goTo('creators')} />
        </div>
      </div>

      <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-5 py-5 md:hidden">
        <div className="flex flex-col gap-5">
          <ValuePointsRow compact />
          <SiteFooter compact />
        </div>
      </div>

      {/* ============ TABLET-LANDSCAPE / DESKTOP (md+, 768px) ============
          ONE full-bleed hero: the artwork is a single absolute background
          layer spanning the entire section — including behind the header —
          with the nav, copy and CTA layered on top as real HTML, not a
          left-column-plus-right-image split. A top scrim hides the
          artwork's own baked logo/nav row so the real header reads
          cleanly; a left-to-right scrim carries the copy; a shallow
          bottom scrim blends into the feature strip. The photo itself
          still reaches the hero's right and bottom edges untouched — no
          card, no border, no visible rectangle. */}
      <div className="relative hidden min-h-[calc(100dvh-126px)] w-full flex-col overflow-hidden md:flex">
        <img
          src={`${import.meta.env.BASE_URL}backdrops/hero-career-desktop.jpg`}
          alt="Five professionals at different career stages — fresher, working professional, career switcher, upskiller — each with a speech bubble, working together at a shared desk."
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, var(--color-bg) 0%, var(--color-bg) 20%, rgba(14,17,22,0.35) 42%, rgba(14,17,22,0) 62%), linear-gradient(180deg, var(--color-bg) 0%, rgba(14,17,22,0) 12%), linear-gradient(180deg, rgba(14,17,22,0) 84%, var(--color-bg) 100%)',
          }}
        />

        <header className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-5 lg:px-12 lg:py-6 xl:px-20">
          <div>
            <Wordmark markClassName="h-7 w-7" className="gap-2.5" />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">A Bhasad.org Product</p>
          </div>

          {/* Below xl (up to 1279px), there isn't reliably enough header
              width for three nav links + account + Sign Out on one line —
              collapse them into the hamburger menu there instead, same
              links, one tap away. Full inline nav returns at xl+. */}
          <div className="relative flex items-center gap-4 xl:hidden">
            <AccountEntry />
            <NavMenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-[6px] border border-[var(--color-line-strong)] bg-black/85 px-5 py-3 text-right backdrop-blur-sm">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      goTo(link.target)
                    }}
                    className="whitespace-nowrap py-1 text-[14px] font-medium text-[var(--color-text)] hover:text-[var(--color-accent-blue)]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hidden items-center gap-7 text-[13px] font-medium text-[var(--color-text)]/90 xl:flex">
            <nav className="flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <button key={link.label} type="button" onClick={() => goTo(link.target)} className="hover:text-[var(--color-accent-blue)]">
                  {link.label}
                </button>
              ))}
            </nav>
            <AccountEntry />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 items-center px-6 lg:px-12 xl:px-20">
          <HeroCopy onDiscover={() => goTo('role')} onWhy={() => goTo('creators')} />
        </div>
      </div>

      {/* Supporting information — the feature strip reads as the hero
          story's conclusion: understand where you stand, what drives your
          value, what to improve, and the decision that follows. */}
      <div className="hidden border-t border-[var(--color-line)] bg-[var(--color-bg)] px-6 py-5 md:block lg:px-12 lg:py-6 xl:px-20">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
          <ValuePointsRow />
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
