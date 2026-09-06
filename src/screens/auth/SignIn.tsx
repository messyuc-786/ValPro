import { useState } from 'react'
import { AuthShell } from './AuthShell'
import { FieldGroup, FieldLabel, TextField } from '../../ui/fields'
import { Button } from '../../ui/Button'
import { signIn, isSupabaseConfigured } from '../../auth/authService'

export function SignIn({ onBack, onSignedIn, onGoToSignUp, onGoToForgotPassword }: {
  onBack?: () => void
  onSignedIn?: () => void
  onGoToSignUp?: () => void
  onGoToForgotPassword?: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    const result = await signIn(email, password)
    if (result.ok) {
      onSignedIn?.()
      return
    }
    setStatus('error')
    setError(result.reason === 'not_configured' ? "Sign-in isn't available yet." : result.message)
  }

  return (
    <AuthShell title="Sign In" subtitle="Save your profile and valuation history across visits." onBack={onBack}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldGroup>
          <FieldLabel htmlFor="signin-email">Email</FieldLabel>
          <TextField id="signin-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="signin-password">Password</FieldLabel>
          <TextField id="signin-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FieldGroup>

        {error && (
          <p role="alert" className="text-[13px] text-[var(--color-negative)]">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || status === 'submitting'}>
          {status === 'submitting' ? 'Signing in…' : 'Sign In'}
        </Button>

        <div className="flex items-center justify-between text-[13px]">
          <button type="button" onClick={onGoToForgotPassword} className="text-[var(--color-accent-blue)]">
            Forgot password?
          </button>
          <button type="button" onClick={onGoToSignUp} className="font-semibold text-[var(--color-accent-blue)]">
            Create account
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
