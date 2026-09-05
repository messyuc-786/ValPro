import type { ReactNode } from 'react'

const SCRIMS = {
  /** Welcome only — the source photograph has a baked-in mockup headline and
   * button in its upper half; the top of this gradient stays strong enough
   * (with a blur on the image) to fully wash that out, while the middle/lower
   * photo — real desk props, not fake UI — is left visible rather than
   * fogged over. Kept strong enough in the middle band too, because on a
   * wide desktop viewport `object-cover` zooms much further into this
   * portrait source image than it does on mobile — the same fake text that
   * was a faint background wash at phone width becomes large and legible if
   * the scrim isn't dark enough to survive that zoom. */
  hero: 'radial-gradient(120% 100% at 18% 38%, transparent 0%, transparent 42%, rgba(9,12,16,.75) 78%, rgba(14,17,22,.97) 100%), linear-gradient(180deg, rgba(8,11,15,.95) 0%, rgba(8,11,15,.78) 40%, rgba(8,11,15,.68) 65%, rgba(8,11,15,.85) 100%)',
  /** Every other screen — the photography there is decorative props (book
   * spines, a notebook, a laptop), not fake UI, so a lighter scrim is enough
   * for text contrast while the art direction stays clearly visible. */
  standard: 'linear-gradient(180deg, rgba(8,11,15,.74) 0%, rgba(8,11,15,.6) 45%, rgba(8,11,15,.8) 100%)',
} as const

interface BackdropProps {
  image: string
  variant?: keyof typeof SCRIMS
  /** Tailwind object-position utility classes, e.g. "object-[center_22%] lg:object-[center_68%]" —
   * a responsive class string rather than a single inline style, since a wide
   * viewport needs a different crop of a portrait source image than a phone does. */
  objectPositionClassName?: string
  /** Tailwind blur utility classes, e.g. "blur-sm lg:blur-lg" — see hero scrim note above. */
  blurClassName?: string
  className?: string
  children: ReactNode
}

/** Full-bleed photographic backdrop + scrim, shared by every screen per the
 * ValPro UI Final Package's per-section backdrop system. */
export function Backdrop({
  image,
  variant = 'standard',
  objectPositionClassName = 'object-center',
  blurClassName = '',
  className = '',
  children,
}: BackdropProps) {
  return (
    <div className={`theme-dark relative isolate flex h-full min-h-full flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] ${className}`}>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover ${objectPositionClassName} ${blurClassName}`}
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
