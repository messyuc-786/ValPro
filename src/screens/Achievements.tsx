import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { Button } from '../ui/Button'
import { SelectField, TextField } from '../ui/fields'
import { AddRowButton, RemovableRow } from '../ui/listRows'
import { ACHIEVEMENT_CATEGORIES } from '../types/profile'
import type { AchievementCategory } from '../types/profile'
import { IconTrophy } from '../ui/icons'

export function Achievements() {
  const { profile, dispatch, goNext, goBack } = useApp()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<AchievementCategory>('leadership')
  const [year, setYear] = useState<number | ''>('')

  function commit() {
    dispatch({ type: 'ADD_ACHIEVEMENT', achievement: { title, category, year: year || new Date().getFullYear() } })
    setTitle('')
    setYear('')
    setAdding(false)
  }

  const categoryLabel = (id: AchievementCategory) => ACHIEVEMENT_CATEGORIES.find((c) => c.id === id)?.label ?? id

  return (
    <ScreenShell screen="achievements" onBack={goBack} footer={<Button className="w-full" onClick={goNext}>Next →</Button>}>
      <h1 className="text-[26px] font-semibold leading-tight">Achievements</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Highlight your key achievements.</p>

      <div className="mt-6 flex flex-col gap-3">
        {profile.achievements.map((a) => (
          <RemovableRow
            key={a.id}
            icon={<IconTrophy className="h-4 w-4" />}
            title={a.title}
            subtitle={categoryLabel(a.category)}
            meta={a.year ? String(a.year) : undefined}
            onRemove={() => dispatch({ type: 'REMOVE_ACHIEVEMENT', id: a.id })}
          />
        ))}

        {adding ? (
          <div className="flex flex-col gap-3 rounded-[3px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-4">
            <TextField autoFocus placeholder="e.g. Reduced cloud infrastructure cost by 22%" value={title} onChange={(e) => setTitle(e.target.value)} />
            <SelectField value={category} onChange={(e) => setCategory(e.target.value as AchievementCategory)}>
              {ACHIEVEMENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </SelectField>
            <TextField
              type="number"
              inputMode="numeric"
              placeholder="Year, e.g. 2024"
              value={year}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button className="flex-1" disabled={!title.trim()} onClick={commit}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <AddRowButton label="Add Achievement" onClick={() => setAdding(true)} />
        )}
      </div>
    </ScreenShell>
  )
}
