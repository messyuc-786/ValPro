import type { ReactNode } from 'react'

const SCRIMS = {
  /** Welcome only — the source photograph has a baked-in mockup headline,
   * button, and a second "Why ValPro Exists" link in its upper half. Paired
   * with the masked blur below (which handles hiding that text), this scrim
   * only needs to carry general text contrast, not do the hiding on its own —
   * so it stays much lighter than earlier passes and lets the photo's own
   * color and detail read through, matching the approved reference. */
  hero: 'linear-gradient(180deg, rgba(8,11,15,.5) 0%, rgba(8,11,15,.22) 30%, rgba(8,11,15,.14) 55%, rgba(8,11,15,.55) 100%)',
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
  /** Tailwind blur utility classes, e.g. "blur-sm lg:blur-lg" — ignored when maskedBlur is set. */
  blurClassName?: string
  /**
   * Welcome's backdrop specifically: rather than blurring the whole photo
   * (which also fogs the real, decorative desk photography lower in the
   * frame — mug, books, newspaper — that has nothing to hide), this renders
   * the image twice: a sharp base layer, and a blurred layer masked to fade
   * out by `maskFadeEnd`, revealing the sharp layer beneath for the rest of
   * the frame. Only the zone that actually contains the source photo's
   * baked-in mockup text gets blurred; the rest stays crisp.
   */
  maskedBlur?: { px: number; fadeStartPercent: number; fadeEndPercent: number }
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
  maskedBlur,
  className = '',
  children,
}: BackdropProps) {
  return (
    <div className={`theme-dark relative isolate flex h-full min-h-full flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] ${className}`}>
      {maskedBlur ? (
        <>
          <img src={image} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover ${objectPositionClassName}`} />
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover ${objectPositionClassName}`}
            style={{
              filter: `blur(${maskedBlur.px}px)`,
              WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${maskedBlur.fadeStartPercent}%, rgba(0,0,0,0) ${maskedBlur.fadeEndPercent}%)`,
              maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${maskedBlur.fadeStartPercent}%, rgba(0,0,0,0) ${maskedBlur.fadeEndPercent}%)`,
            }}
          />
        </>
      ) : (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover ${objectPositionClassName} ${blurClassName}`}
        />
      )}
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
