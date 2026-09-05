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

// text-[16px], not 15px: iOS Safari auto-zooms the whole page on focus for
// any input/select rendered under 16px — a jarring, distinctly "website"
// behavior a native-feeling app never does. 16px is the floor that avoids it.
const controlClass =
  'w-full rounded-[3px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3.5 py-3 text-[16px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent-blue)]'

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
        // The switch stays a visually compact 44x24 pill, but its tappable
        // area (via the invisible ::before) extends to a full 44px square —
        // a small pill is a common enough spot to miss-tap otherwise.
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors before:absolute before:-inset-2.5 before:content-[''] ${checked ? 'bg-[var(--color-accent-blue)]' : 'bg-[var(--color-line-strong)]'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-[var(--color-surface)] transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}
