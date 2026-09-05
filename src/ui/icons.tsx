/**
 * A small, restrained line-icon set — no icon library, no emoji, no decorative
 * illustration. Each icon is a purposeful 20x20 outline used exactly once per
 * context (role type, domain, achievement category, signal polarity).
 */
type IconProps = { className?: string }

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 20 20',
}

export function IconStudent({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M2.5 7.5 10 4l7.5 3.5L10 11 2.5 7.5Z" />
      <path d="M5.5 9.2v3.4c0 1 2 2.1 4.5 2.1s4.5-1.1 4.5-2.1V9.2" />
    </svg>
  )
}

export function IconFresher({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 17V8.5L10 5l6 3.5V17" />
      <path d="M8 17v-5h4v5" />
    </svg>
  )
}

export function IconBriefcase({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="2.5" y="6.5" width="15" height="9.5" rx="1.2" />
      <path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5" />
      <path d="M2.5 10.8h15" />
    </svg>
  )
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="M16.5 16.5 13 13" />
    </svg>
  )
}

export function IconSwitch({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 7h10.5L12 4.5" />
      <path d="M16 13H5.5L8 15.5" />
    </svg>
  )
}

export function IconLaptop({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="4" width="12" height="8" rx="1" />
      <path d="M2 15.5h16" />
    </svg>
  )
}

export function IconBank({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3 8.2 10 4l7 4.2" />
      <path d="M4 8.5v6M8 8.5v6M12 8.5v6M16 8.5v6" />
      <path d="M3 16h14" />
    </svg>
  )
}

export function IconGraduationCap({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M2 8 10 4l8 4-8 4-8-4Z" />
      <path d="M6 10.5v3.2c0 1.1 1.8 2.3 4 2.3s4-1.2 4-2.3v-3.2" />
    </svg>
  )
}

export function IconTrophy({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 3.5h8v4.5a4 4 0 0 1-8 0V3.5Z" />
      <path d="M6 4.5H3.8A2.3 2.3 0 0 0 6 7.3" />
      <path d="M14 4.5h2.2A2.3 2.3 0 0 1 14 7.3" />
      <path d="M10 12.5v2.3M7.3 16.5h5.4" />
    </svg>
  )
}

export function IconPlusCircle({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 7v6M7 10h6" />
    </svg>
  )
}

export function IconMinusCircle({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="10" r="7" />
      <path d="M7 10h6" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="10" r="7" />
      <path d="M7.2 10.2l1.9 1.9 3.7-4.2" />
    </svg>
  )
}

export function IconRing({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="10" r="7" strokeDasharray="14 8" />
    </svg>
  )
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12.5 4.5 6.5 10l6 5.5" />
    </svg>
  )
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M7.5 4.5 13.5 10l-6 5.5" />
    </svg>
  )
}

export function IconClose({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  )
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M10 3v9.5M6.2 9l3.8 3.8L13.8 9" />
      <path d="M3.5 15.5h13" />
    </svg>
  )
}

export function IconShare({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="15" cy="5" r="2" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="15" cy="15" r="2" />
      <path d="M6.8 9 13.2 6M6.8 11l6.4 3" />
    </svg>
  )
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
    </svg>
  )
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="7.5" cy="7" r="2.5" />
      <path d="M2.8 15.5c0-2.6 2.1-4.2 4.7-4.2s4.7 1.6 4.7 4.2" />
      <circle cx="14" cy="7.8" r="2" />
      <path d="M13 11.6c1.9.3 3.5 1.6 3.5 3.9" />
    </svg>
  )
}

export function IconBarChartUp({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3.5 16.5v-4M8 16.5V9M12.5 16.5v-7M17 16.5V6" />
    </svg>
  )
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.4" />
      <circle cx="10" cy="10" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function IconLink({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M8.5 11.5 11.5 8.5" />
      <path d="M9 6.2 10.5 4.7a2.6 2.6 0 0 1 3.7 3.7L12.7 9.9" />
      <path d="M11 13.8 9.5 15.3a2.6 2.6 0 0 1-3.7-3.7L7.3 10.1" />
    </svg>
  )
}
