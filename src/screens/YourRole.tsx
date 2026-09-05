import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { OptionCard } from '../ui/OptionCard'
import { Button } from '../ui/Button'
import { ROLE_TYPES } from '../types/profile'
import { IconBriefcase, IconFresher, IconSearch, IconStudent, IconSwitch } from '../ui/icons'

const ICONS = {
  student: IconStudent,
  fresher: IconFresher,
  working_professional: IconBriefcase,
  job_seeker: IconSearch,
  career_switcher: IconSwitch,
} as const

export function YourRole() {
  const { profile, dispatch, goNext, goBack } = useApp()

  return (
    <ScreenShell
      screen="role"
      onBack={goBack}
      footer={
        <Button className="w-full" disabled={!profile.role} onClick={goNext}>
          Next →
        </Button>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight">What best describes you?</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Help us personalize your experience.</p>

      <div className="mt-6 flex flex-col gap-2.5">
        {ROLE_TYPES.map((r) => {
          const Icon = ICONS[r.id]
          return (
            <OptionCard
              key={r.id}
              icon={<Icon className="h-[18px] w-[18px]" />}
              label={r.label}
              detail={r.detail}
              selected={profile.role === r.id}
              onClick={() => dispatch({ type: 'SET_ROLE', role: r.id })}
            />
          )
        })}
      </div>
    </ScreenShell>
  )
}
