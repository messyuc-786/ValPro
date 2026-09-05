import type { ReactNode } from 'react'

const SCRIMS = {
  /** Welcome only — the source photograph has a baked-in mockup headline,
   * button, and a second "Why ValPro Exists" link in its upper half. On this
   * card's aspect ratio `object-cover` shows almost the full image height
   * (unlike a wide desktop crop), so that fake text is always in frame —
   * this scrim (with a blur on the image) has to stay strong enough through
   * the top ~60% to fully wash it out, or it visibly doubles with our real
   * text. The bottom band stays lighter so the desk props (real photography,
   * not fake UI) still read with some warmth behind the stats panel. */
  hero: 'linear-gradient(180deg, rgba(8,11,15,.94) 0%, rgba(8,11,15,.86) 35%, rgba(8,11,15,.7) 60%, rgba(8,11,15,.5) 78%, rgba(8,11,15,.82) 100%)',
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
