import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-[12.5px] font-semibold text-[var(--color-muted)]">
      {children}
    </label>
  )
}

const controlClass =
  'w-full rounded-[3px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3.5 py-3 text-[15px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]'

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ''}`} />
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select {...props} className={`${controlClass} ${props.className ?? ''}`}>
      {props.children}
    </select>
  )
}

export function ToggleRow({
  label,
  checked,
  onChange,
  id,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  id: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <label htmlFor={id} className="text-[14px] text-[var(--color-text)]">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-line-strong)]'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-[var(--color-surface)] transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}
