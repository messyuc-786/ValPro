import type { ReactNode } from 'react'
import { IconCheck } from './icons'

interface OptionCardProps {
  icon: ReactNode
  label: string
  detail: string
  selected: boolean
  onClick: () => void
}

/** An editorial list row, not a bordered card — selection reads through the
 * accent-colored label and a trailing check rather than a filled box, per the
 * package's "editorial rows instead of huge cards" direction. */
export function OptionCard({ icon, label, detail, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex w-full items-center gap-3.5 border-b border-[var(--color-line)] py-4 text-left first:border-t"
    >
      <span className={`shrink-0 ${selected ? 'text-[var(--color-accent-blue)]' : 'text-[var(--color-muted)]'}`}>{icon}</span>
      <span className="flex flex-1 flex-col">
        <span className={`text-[15px] font-semibold ${selected ? 'text-[var(--color-accent-blue)]' : 'text-[var(--color-text)]'}`}>{label}</span>
        <span className="text-[12.5px] text-[var(--color-muted)]">{detail}</span>
      </span>
      {selected && <IconCheck className="h-5 w-5 shrink-0 text-[var(--color-accent-blue)]" />}
    </button>
  )
}
