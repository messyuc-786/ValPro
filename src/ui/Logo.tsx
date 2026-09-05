/**
 * ValPro wordmark + monogram. The UI package's "logo direction" asset was mood
 * photography, not artwork to trace, so this is an original mark: a chevron
 * reading as both a rising market line and the letter V, in a thin circle so
 * it reads at favicon size and survives on both dark and light grounds.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path d="M9.5 12.5 16 21l6.5-8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

export function Wordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark className={markClassName ?? 'h-5 w-5'} />
      <span className="font-display text-[17px] font-semibold tracking-tight">ValPro</span>
    </span>
  )
}
