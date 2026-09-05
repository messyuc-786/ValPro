import type { ReactNode } from 'react'

interface OptionCardProps {
  icon: ReactNode
  label: string
  detail: string
  selected: boolean
  onClick: () => void
}

export function OptionCard({ icon, label, detail, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3.5 rounded-[3px] border bg-[var(--color-surface)] px-4 py-3.5 text-left transition-colors ${
        selected ? 'border-[var(--color-accent)] border-l-[3px]' : 'border-[var(--color-line-strong)]'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-line-strong)] text-[var(--color-muted)]'
        }`}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold text-[var(--color-text)]">{label}</span>
        <span className="text-[12.5px] text-[var(--color-muted)]">{detail}</span>
      </span>
    </button>
  )
}
