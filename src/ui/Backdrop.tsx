import type { CSSProperties, ReactNode } from 'react'

const SCRIMS = {
  /** Welcome only — the source photograph has a baked-in mockup headline and
   * button in its upper half; the top of this gradient stays strong enough
   * (with a light blur on the image) to fully wash that out, while the
   * middle/lower photo — real desk props, not fake UI — is left visible
   * rather than fogged over. */
  hero: 'linear-gradient(180deg, rgba(8,11,15,.94) 0%, rgba(8,11,15,.62) 40%, rgba(8,11,15,.4) 65%, rgba(8,11,15,.78) 100%)',
  /** Every other screen — the photography there is decorative props (book
   * spines, a notebook, a laptop), not fake UI, so a lighter scrim is enough
   * for text contrast while the art direction stays clearly visible. */
  standard: 'linear-gradient(180deg, rgba(8,11,15,.74) 0%, rgba(8,11,15,.6) 45%, rgba(8,11,15,.8) 100%)',
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
        className={`absolute inset-0 h-full w-full object-cover ${blur ? 'scale-105 blur-sm' : ''}`}
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
