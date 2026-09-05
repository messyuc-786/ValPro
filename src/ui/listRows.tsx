import type { ReactNode } from 'react'
import { IconClose, IconPlusCircle } from './icons'

export function RemovableRow({
  title,
  subtitle,
  meta,
  icon,
  onRemove,
}: {
  title: string
  subtitle?: string
  meta?: string
  icon?: ReactNode
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-[3px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-3">
      {icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text)]">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-semibold text-[var(--color-text)]">{title}</p>
        {subtitle && <p className="truncate text-[12.5px] text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      {meta && <span className="shrink-0 font-mono text-[12px] text-[var(--color-muted)] tabular">{meta}</span>}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${title}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-negative)]"
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  )
}

export function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-[3px] border border-dashed border-[var(--color-line-strong)] px-4 py-3 text-[14px] font-semibold text-[var(--color-text)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)]"
    >
      <IconPlusCircle className="h-4 w-4" />
      {label}
    </button>
  )
}

export function SkillBar({ name, proficiency }: { name: string; proficiency: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-medium text-[var(--color-text)]">{name}</span>
        <span className="font-mono text-[12px] text-[var(--color-muted)] tabular">{proficiency}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
        <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${proficiency}%` }} />
      </div>
    </div>
  )
}
