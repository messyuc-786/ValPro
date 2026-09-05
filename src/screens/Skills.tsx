import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { Button } from '../ui/Button'
import { TextField } from '../ui/fields'
import { AddRowButton } from '../ui/listRows'
import { SkillBar } from '../ui/listRows'
import { IconClose } from '../ui/icons'

export function Skills() {
  const { profile, dispatch, goNext, goBack } = useApp()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [proficiency, setProficiency] = useState(70)

  function commit() {
    dispatch({ type: 'ADD_SKILL', skill: { name, proficiency } })
    setName('')
    setProficiency(70)
    setAdding(false)
  }

  return (
    <ScreenShell
      screen="skills"
      onBack={goBack}
      footer={
        <Button className="w-full" disabled={profile.skills.length === 0} onClick={goNext}>
          Next →
        </Button>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight">Your Skills</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Add your key skills and proficiency level.</p>

      <div className="mt-6 flex flex-col gap-4">
        {profile.skills.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className="flex-1">
              <SkillBar name={s.name} proficiency={s.proficiency} />
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'REMOVE_SKILL', id: s.id })}
              aria-label={`Remove ${s.name}`}
              className="text-[var(--color-muted)] hover:text-[var(--color-negative)]"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="flex flex-col gap-3 rounded-[3px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-4">
            <TextField autoFocus placeholder="Skill name, e.g. Python" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={proficiency}
                onChange={(e) => setProficiency(Number(e.target.value))}
                className="flex-1 accent-[var(--color-accent)]"
                aria-label="Proficiency"
              />
              <span className="w-10 shrink-0 font-mono text-[13px] text-[var(--color-muted)] tabular">{proficiency}%</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button className="flex-1" disabled={!name.trim()} onClick={commit}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <AddRowButton label={profile.skills.length === 0 ? 'Add a Skill' : 'Add Another Skill'} onClick={() => setAdding(true)} />
        )}
      </div>
    </ScreenShell>
  )
}
