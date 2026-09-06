import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { ForgotPassword } from './ForgotPassword'

/**
 * These screens are not wired into the app's navigation yet (see
 * AuthShell.tsx) — rendered and tested standalone. With no Supabase project
 * configured (today's real state), every submit path must degrade to a
 * clear message rather than silently doing nothing or throwing.
 */
describe('SignIn (standalone, no Supabase project configured)', () => {
  it('renders the not-configured notice and a disabled submit button', () => {
    render(<SignIn />)
    expect(screen.getByRole('status')).toHaveTextContent(/accounts aren't available yet/i)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
  })

  it('invokes onGoToSignUp / onGoToForgotPassword callbacks', async () => {
    const onGoToSignUp = vi.fn()
    const onGoToForgotPassword = vi.fn()
    const user = userEvent.setup()
    render(<SignIn onGoToSignUp={onGoToSignUp} onGoToForgotPassword={onGoToForgotPassword} />)

    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(onGoToSignUp).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /forgot password/i }))
    expect(onGoToForgotPassword).toHaveBeenCalledTimes(1)
  })
})

describe('SignUp (standalone, no Supabase project configured)', () => {
  it('keeps submit disabled until username/email/password are all valid, and always disabled without a configured project', async () => {
    const user = userEvent.setup()
    render(<SignUp />)
    const submit = screen.getByRole('button', { name: /create account/i })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/^email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'a-real-password')

    // Valid input alone still doesn't enable it — no project is configured.
    expect(submit).toBeDisabled()
  })
})

describe('ForgotPassword (standalone, no Supabase project configured)', () => {
  it('renders with submit disabled', () => {
    render(<ForgotPassword />)
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled()
  })
})
