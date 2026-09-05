import type { CSSProperties, ReactNode } from 'react'

const SCRIMS = {
  /** Welcome only — the source photograph has a baked-in mockup headline and
   * button; this scrim (paired with a blur on the image itself) is tuned to
   * fully wash that out while keeping the skyline glow and desk props as
   * ambient texture behind our own real, responsive text. */
  hero: 'linear-gradient(180deg, rgba(10,13,17,.93) 0%, rgba(10,13,17,.72) 38%, rgba(10,13,17,.6) 62%, rgba(10,13,17,.94) 100%)',
  /** Every other screen — the photography there is decorative props (book
   * spines, a notebook, a laptop), not fake UI, so a lighter, even scrim is
   * enough for text contrast without hiding the art direction. */
  standard: 'linear-gradient(180deg, rgba(10,13,17,.88) 0%, rgba(10,13,17,.8) 45%, rgba(10,13,17,.9) 100%)',
} as const

interface BackdropProps {
  image: string
  variant?: keyof typeof SCRIMS
  objectPosition?: string
  blur?: boolean
  className?: string
  children: ReactNode
}

/** Full-bleed photographic backdrop + scrim, shared by every screen per the
 * ValPro UI Final Package's per-section backdrop system. */
export function Backdrop({ image, variant = 'standard', objectPosition = 'center', blur = false, className = '', children }: BackdropProps) {
  const imgStyle: CSSProperties = { objectPosition }
  return (
    <div className={`theme-dark relative isolate flex h-full min-h-full flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] ${className}`}>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        style={imgStyle}
        className={`absolute inset-0 h-full w-full object-cover ${blur ? 'scale-110 blur-md' : ''}`}
      />
      <div className="absolute inset-0" style={{ background: SCRIMS[variant] }} />
      <div className="relative z-10 flex h-full min-h-full flex-col">{children}</div>
    </div>
  )
}

/** Small, restrained brand mark used in the footer of every screen per the
 * package's "Bhasad.org in the footer of all pages" rule. */
export function FooterMark({ className = '' }: { className?: string }) {
  return <span className={`text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)] ${className}`}>Bhasad.org</span>
}
