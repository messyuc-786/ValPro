import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { Button } from '../ui/Button'
import { FieldGroup, FieldLabel, SelectField, TextField, ToggleRow } from '../ui/fields'
import { EXPERIENCE_BANDS } from '../types/profile'

export function Experience() {
  const { profile, dispatch, goNext, goBack } = useApp()
  const { experience } = profile
  const canContinue = Boolean(experience.band && experience.currentRole)

  return (
    <ScreenShell
      screen="experience"
      onBack={goBack}
      footer={
        <Button className="w-full" disabled={!canContinue} onClick={goNext}>
          Next →
        </Button>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight">Your Experience</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Add your professional experience.</p>

      <div className="mt-6 flex flex-col gap-4">
        <FieldGroup>
          <FieldLabel htmlFor="totalExp">Total Experience</FieldLabel>
          <SelectField
            id="totalExp"
            value={experience.band}
            onChange={(e) => dispatch({ type: 'SET_EXPERIENCE', experience: { band: e.target.value as never } })}
          >
            <option value="" disabled>
              Select experience
            </option>
            {EXPERIENCE_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </SelectField>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="currentRole">Current Role</FieldLabel>
          <TextField
            id="currentRole"
            placeholder="e.g. Software Engineer"
            value={experience.currentRole}
            onChange={(e) => dispatch({ type: 'SET_EXPERIENCE', experience: { currentRole: e.target.value } })}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="currentCompany">Current Company</FieldLabel>
          <TextField
            id="currentCompany"
            placeholder="e.g. TechSolutions Pvt. Ltd."
            value={experience.currentCompany}
            onChange={(e) => dispatch({ type: 'SET_EXPERIENCE', experience: { currentCompany: e.target.value } })}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="industry">Industry</FieldLabel>
          <TextField
            id="industry"
            placeholder="e.g. IT Services"
            value={experience.industry}
            onChange={(e) => dispatch({ type: 'SET_EXPERIENCE', experience: { industry: e.target.value } })}
          />
        </FieldGroup>

        <div className="border-t border-[var(--color-line)] pt-3">
          <ToggleRow
            id="leadership"
            label="I have leadership experience"
            checked={experience.hasLeadershipExperience}
            onChange={(value) => dispatch({ type: 'SET_EXPERIENCE', experience: { hasLeadershipExperience: value } })}
          />
        </div>
      </div>
    </ScreenShell>
  )
}
