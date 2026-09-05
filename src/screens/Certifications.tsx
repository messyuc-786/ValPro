import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { Button } from '../ui/Button'
import { TextField } from '../ui/fields'
import { AddRowButton, RemovableRow } from '../ui/listRows'
import { IconGraduationCap } from '../ui/icons'

export function Certifications() {
  const { profile, dispatch, goNext, goBack } = useApp()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [year, setYear] = useState<number | ''>('')

  function commit() {
    dispatch({ type: 'ADD_CERTIFICATION', certification: { name, issuer, year: year || new Date().getFullYear() } })
    setName('')
    setIssuer('')
    setYear('')
    setAdding(false)
  }

  return (
    <ScreenShell screen="certifications" onBack={goBack} footer={<Button className="w-full" onClick={goNext}>Next →</Button>}>
      <h1 className="text-[26px] font-semibold leading-tight">Certifications</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Add relevant certifications.</p>

      <div className="mt-6 flex flex-col gap-3">
        {profile.certifications.map((c) => (
          <RemovableRow
            key={c.id}
            icon={<IconGraduationCap className="h-4 w-4" />}
            title={c.name}
            subtitle={c.issuer}
            meta={c.year ? String(c.year) : undefined}
            onRemove={() => dispatch({ type: 'REMOVE_CERTIFICATION', id: c.id })}
          />
        ))}

        {adding ? (
          <div className="flex flex-col gap-3 rounded-[3px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-4">
            <TextField autoFocus placeholder="Certification, e.g. AWS Solutions Architect" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField placeholder="Issuer, e.g. Amazon Web Services" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
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
              <Button className="flex-1" disabled={!name.trim()} onClick={commit}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <AddRowButton label="Add Certification" onClick={() => setAdding(true)} />
        )}
      </div>
    </ScreenShell>
  )
}
