import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { OptionCard } from '../ui/OptionCard'
import { Button } from '../ui/Button'
import { TextField } from '../ui/fields'
import { DOMAIN_CATEGORIES, DOMAIN_OPTIONS } from '../types/profile'
import type { DomainId } from '../types/profile'
import { IconBank, IconBriefcase, IconFresher, IconGraduationCap, IconLaptop, IconSearch } from '../ui/icons'

// A handful of domains get a bespoke icon; every other domain (the broader
// taxonomy added for market coverage — see docs/VALPRO_CURRENT_BASELINE.md)
// shares one restrained generic mark rather than 35 one-off icons designed
// on a guess. Content, not decoration, is what's authoritative here.
const ICONS: Partial<Record<DomainId, typeof IconLaptop>> = {
  technology: IconLaptop,
  banking: IconBank,
  education: IconGraduationCap,
  fresher: IconFresher,
}

export function DomainSelection() {
  const { profile, dispatch, goNext, goBack } = useApp()
  const [query, setQuery] = useState('')

  // A flat list of 35 options is exactly the "giant, overwhelming list" the
  // brief warns against — a live text filter plus category sections keeps
  // it navigable without touching OptionCard or the visual language at all.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DOMAIN_OPTIONS
    return DOMAIN_OPTIONS.filter((d) => d.label.toLowerCase().includes(q) || d.detail.toLowerCase().includes(q))
  }, [query])

  const byCategory = useMemo(() => {
    return DOMAIN_CATEGORIES.map((category) => ({
      category,
      options: filtered.filter((d) => d.category === category),
    })).filter((group) => group.options.length > 0)
  }, [filtered])

  return (
    <ScreenShell
      screen="domain"
      onBack={goBack}
      footer={
        <Button className="w-full" disabled={!profile.domain} onClick={goNext}>
          Next →
        </Button>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight">Choose your professional domain</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Select the area that best matches your work or career goal.</p>

      <div className="relative mt-5">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <TextField
          type="search"
          placeholder="Search domains…"
          aria-label="Search domains"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {byCategory.length === 0 ? (
        <p className="mt-8 text-[13.5px] text-[var(--color-muted)]">
          No domain matches "{query}" — try a different term, or pick "Other" if nothing fits.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {byCategory.map((group) => (
            <div key={group.category}>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">{group.category}</p>
              <div className="mt-2.5 flex flex-col gap-2.5">
                {group.options.map((d) => {
                  const Icon = ICONS[d.id] ?? IconBriefcase
                  return (
                    <OptionCard
                      key={d.id}
                      icon={<Icon className="h-[18px] w-[18px]" />}
                      label={d.label}
                      detail={d.detail}
                      selected={profile.domain === d.id}
                      onClick={() => dispatch({ type: 'SET_DOMAIN', domain: d.id })}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
