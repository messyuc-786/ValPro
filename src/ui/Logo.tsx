/**
 * ValPro mark — a rising-bars + chevron "V", in the approved purple → blue →
 * teal gradient, works as an app icon, a header mark, and on the share card.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="valproMarkGradient" x1="2" y1="26" x2="30" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="0.5" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="19" width="3.4" height="7" rx="1" fill="url(#valproMarkGradient)" opacity="0.85" />
      <rect x="7.4" y="15" width="3.4" height="11" rx="1" fill="url(#valproMarkGradient)" opacity="0.92" />
      <rect x="12.3" y="10.5" width="3.4" height="15.5" rx="1" fill="url(#valproMarkGradient)" />
      <path
        d="M15 15.5 20.5 25 29 8.5"
        stroke="url(#valproMarkGradient)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Wordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark className={markClassName ?? 'h-6 w-6'} />
      <span className="font-display text-[17px] font-semibold tracking-tight">ValPro</span>
    </span>
  )
}

/** Full lockup — mark, wordmark, and brand tagline stacked — for the Welcome
 * hero, the share card, and any future splash context. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-1.5 ${className ?? ''}`}>
      <span className="inline-flex items-center gap-2.5">
        <LogoMark className="h-8 w-8" />
        <span className="font-display text-[22px] font-semibold tracking-tight">ValPro</span>
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        Know Your Worth. Grow Your Tomorrow.
      </span>
    </div>
  )
}
