import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline'
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-[3px] px-5 py-3.5 text-[15px] font-semibold font-sans transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px'

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  // Steel blue is the one recognizable active accent — every primary CTA uses it.
  primary: 'bg-[var(--color-accent-blue)] text-white hover:opacity-90',
  accent: 'bg-[var(--color-accent-blue)] text-white hover:opacity-90',
  outline: 'border border-[var(--color-line-strong)] text-[var(--color-text)] hover:bg-white/5',
  ghost: 'text-[var(--color-text)] hover:opacity-70 px-2 py-1',
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
