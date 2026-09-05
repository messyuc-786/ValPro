import type { ReactNode } from 'react'

const SCRIMS = {
  /** Welcome's mobile/tablet-portrait card — the source photograph has a
   * baked-in mockup headline, button and "Why ValPro Exists" link across
   * roughly its top 0-72%. At this card's aspect ratio `object-cover` shows
   * nearly the full image height, so — unlike the desktop band, which is
   * wide enough to crop that zone out of frame entirely — that text is
   * always present in the visible window here. No-blur was a hard
   * requirement, and testing confirmed even a 0.97-opacity overlay still
   * let bright baked text show through faintly; only a fully solid overlay
   * (opacity 1) actually erases it. So the top ~72% (nav through the CTA)
   * sits on a solid near-black ground — which reads as a deliberate title
   * card on the app's own primary color, not a rendering bug — and the
   * photograph is revealed at full, unblurred sharpness for the bottom
   * ~28% (from "Why ValPro Exists" down through the stats/footer), which is
   * genuinely clean in the source image. */
  hero: 'linear-gradient(180deg, rgba(4,5,7,1) 0%, rgba(4,5,7,1) 72%, rgba(4,5,7,.4) 85%, rgba(4,5,7,.6) 100%)',
  /** Welcome's desktop/tablet-landscape hero band — a full-bleed section
   * shorter than the viewport, bottom-anchored (`object-[center_100%]`) so
   * it shows the source photo's own cleanest crop. Because the band is a
   * landscape shape, `object-cover` zooms in further than the mobile card
   * does, so a moderate strip at the top can still carry a trailing edge of
   * the baked text — same no-blur, overlay-only treatment, just weighted
   * toward the top of the band where the real header/headline content sits
   * anyway and needs the contrast regardless. */
  heroBand: 'linear-gradient(180deg, rgba(6,8,11,.97) 0%, rgba(6,8,11,.9) 32%, rgba(6,8,11,.55) 50%, rgba(6,8,11,.16) 68%, rgba(6,8,11,.12) 100%)',
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
  className?: string
  children: ReactNode
}

/** Full-bleed photographic backdrop + scrim, shared by every screen per the
 * ValPro UI Final Package's per-section backdrop system. No blur is applied
 * to the photo anywhere — per the approved direction the photograph must
 * stay sharp and recognizable; a dark overlay (tuned per `variant` above)
 * carries all the text-legibility and baked-mockup-text-hiding work. */
export function Backdrop({ image, variant = 'standard', objectPositionClassName = 'object-center', className = '', children }: BackdropProps) {
  return (
    <div className={`theme-dark relative isolate flex h-full min-h-full flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] ${className}`}>
      <img src={image} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover ${objectPositionClassName}`} />
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
