import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { OptionCard } from '../ui/OptionCard'
import { Button } from '../ui/Button'
import { DOMAIN_OPTIONS } from '../types/profile'
import { IconBank, IconFresher, IconGraduationCap, IconLaptop } from '../ui/icons'

const ICONS = {
  technology: IconLaptop,
  banking: IconBank,
  education: IconGraduationCap,
  fresher: IconFresher,
} as const

export function DomainSelection() {
  const { profile, dispatch, goNext, goBack } = useApp()

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

      <div className="mt-6 flex flex-col gap-2.5">
        {DOMAIN_OPTIONS.map((d) => {
          const Icon = ICONS[d.id]
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
    </ScreenShell>
  )
}
