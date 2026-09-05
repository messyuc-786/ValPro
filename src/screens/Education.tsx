import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { Button } from '../ui/Button'
import { FieldGroup, FieldLabel, SelectField, TextField } from '../ui/fields'
import { QUALIFICATIONS } from '../types/profile'

export function Education() {
  const { profile, dispatch, goNext, goBack } = useApp()
  const { education } = profile
  const canContinue = Boolean(education.qualification && education.institute && education.marks !== '')

  return (
    <ScreenShell
      screen="education"
      onBack={goBack}
      footer={
        <Button className="w-full" disabled={!canContinue} onClick={goNext}>
          Next →
        </Button>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight">Your Education</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Tell us about your highest qualification.</p>

      <div className="mt-6 flex flex-col gap-4">
        <FieldGroup>
          <FieldLabel htmlFor="qualification">Highest Qualification</FieldLabel>
          <SelectField
            id="qualification"
            value={education.qualification}
            onChange={(e) => dispatch({ type: 'SET_EDUCATION', education: { qualification: e.target.value as never } })}
          >
            <option value="" disabled>
              Select qualification
            </option>
            {QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </SelectField>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="specialization">Specialization</FieldLabel>
          <TextField
            id="specialization"
            placeholder="e.g. Computer Science"
            value={education.specialization}
            onChange={(e) => dispatch({ type: 'SET_EDUCATION', education: { specialization: e.target.value } })}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="institute">Institute / University</FieldLabel>
          <TextField
            id="institute"
            placeholder="e.g. Indian Institute of Technology (IIT)"
            value={education.institute}
            onChange={(e) => dispatch({ type: 'SET_EDUCATION', education: { institute: e.target.value } })}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="gradYear">Graduation Year</FieldLabel>
          <TextField
            id="gradYear"
            type="number"
            inputMode="numeric"
            placeholder="2024"
            value={education.graduationYear}
            onChange={(e) => dispatch({ type: 'SET_EDUCATION', education: { graduationYear: e.target.value ? Number(e.target.value) : '' } })}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="marks">Marks / CGPA</FieldLabel>
          <div className="flex items-center gap-2">
            <TextField
              id="marks"
              type="number"
              step="0.1"
              min={0}
              max={10}
              inputMode="decimal"
              placeholder="8.7"
              value={education.marks}
              onChange={(e) => dispatch({ type: 'SET_EDUCATION', education: { marks: e.target.value ? Number(e.target.value) : '' } })}
            />
            <span className="shrink-0 text-[14px] text-[var(--color-muted)]">/ 10</span>
          </div>
        </FieldGroup>
      </div>
    </ScreenShell>
  )
}
