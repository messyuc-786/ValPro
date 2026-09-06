import { useState } from 'react'
import { AuthShell } from './AuthShell'
import { FieldGroup, FieldLabel, TextField } from '../../ui/fields'
import { Button } from '../../ui/Button'
import { signUp, isSupabaseConfigured } from '../../auth/authService'

export function SignUp({ onBack, onSignedUp, onGoToSignIn }: { onBack?: () => void; onSignedUp?: () => void; onGoToSignIn?: () => void }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState('')

  const canSubmit = username.trim().length >= 3 && /\S+@\S+\.\S+/.test(email) && password.length >= 8

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('submitting')
    setError('')
    const result = await signUp(email, password, username.trim())
    if (result.ok) {
      onSignedUp?.()
      return
    }
    setStatus('error')
    setError(result.reason === 'not_configured' ? "Account creation isn't available yet." : result.message)
  }

  return (
    <AuthShell title="Create Account" subtitle="Save your profile and come back to it anytime." onBack={onBack}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldGroup>
          <FieldLabel htmlFor="signup-username">Username</FieldLabel>
          <TextField id="signup-username" required minLength={3} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <TextField id="signup-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <TextField id="signup-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-[11.5px] text-[var(--color-muted)]">At least 8 characters.</p>
        </FieldGroup>

        {error && (
          <p role="alert" className="text-[13px] text-[var(--color-negative)]">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || !canSubmit || status === 'submitting'}>
          {status === 'submitting' ? 'Creating account…' : 'Create Account'}
        </Button>

        <div className="text-center text-[13px]">
          Already have an account?{' '}
          <button type="button" onClick={onGoToSignIn} className="font-semibold text-[var(--color-accent-blue)]">
            Sign in
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
