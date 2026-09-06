import { useState } from 'react'
import { AuthShell } from './AuthShell'
import { FieldGroup, FieldLabel, TextField } from '../../ui/fields'
import { Button } from '../../ui/Button'
import { requestPasswordReset, isSupabaseConfigured } from '../../auth/authService'

export function ForgotPassword({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    const result = await requestPasswordReset(email)
    if (result.ok) {
      setStatus('sent')
      return
    }
    setStatus('error')
    setError(result.reason === 'not_configured' ? "Password reset isn't available yet." : result.message)
  }

  if (status === 'sent') {
    return (
      <AuthShell title="Check Your Email" subtitle={`If an account exists for ${email}, a reset link is on its way.`} onBack={onBack} />
    )
  }

  return (
    <AuthShell title="Reset Password" subtitle="We'll email you a link to reset your password." onBack={onBack}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldGroup>
          <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
          <TextField id="forgot-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FieldGroup>

        {error && (
          <p role="alert" className="text-[13px] text-[var(--color-negative)]">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>
    </AuthShell>
  )
}
