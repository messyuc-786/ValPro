import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

/**
 * End-to-end-ish flow test driven through the real App + AppProvider, exercising
 * navigation, role/domain selection, skill add/remove, and the eventual result
 * screens — without a browser test runner.
 */
async function fillOnboarding(user: ReturnType<typeof userEvent.setup>) {
  // Welcome -> Role
  // Welcome renders a mobile and a desktop variant simultaneously (CSS-hidden,
  // not DOM-removed, at any one viewport) — jsdom doesn't evaluate the media
  // query, so both are "visible" to a DOM query; the mobile one is first.
  await user.click(screen.getAllByRole('button', { name: /discover your market value/i })[0])

  // Role
  await user.click(screen.getByRole('button', { name: /working professional/i }))
  await user.click(screen.getByRole('button', { name: /^next/i }))

  // Domain
  await user.click(screen.getByRole('button', { name: /technology/i }))
  await user.click(screen.getByRole('button', { name: /^next/i }))

  // Education
  await user.selectOptions(screen.getByLabelText(/highest qualification/i), "Bachelor's Degree")
  await user.type(screen.getByLabelText(/institute \/ university/i), 'Indian Institute of Technology (IIT)')
  await user.type(screen.getByLabelText(/marks \/ cgpa/i), '8.7')
  await user.click(screen.getByRole('button', { name: /^next/i }))

  // Experience
  await user.selectOptions(screen.getByLabelText(/total experience/i), '3-5')
  await user.type(screen.getByLabelText(/current role/i), 'Software Engineer')
  await user.click(screen.getByRole('button', { name: /^next/i }))

  // Skills — add one, then it should be required before continuing
  await user.click(screen.getByRole('button', { name: /add a skill/i }))
  await user.type(screen.getByPlaceholderText(/skill name/i), 'AWS')
  await user.click(screen.getByRole('button', { name: /^add$/i }))
  await user.click(screen.getByRole('button', { name: /^next/i }))

  // Certifications — skip
  await user.click(screen.getByRole('button', { name: /^next/i }))

  // Achievements — skip
  await user.click(screen.getByRole('button', { name: /^next/i }))

  // Location
  await user.selectOptions(screen.getByLabelText(/current location/i), 'Bangalore')
  await user.click(screen.getByRole('button', { name: /analyze my value/i }))
}

describe('ValPro end-to-end flow', () => {
  it('walks from Welcome through onboarding into the Result screens', async () => {
    localStorage.clear()
    const user = userEvent.setup()
    render(<App />)

    await fillOnboarding(user)

    // Analysis screen appears, then auto-advances to the result overview.
    expect(await screen.findByText(/analyzing your profile/i)).toBeInTheDocument()
    expect(await screen.findByText(/your market value/i, {}, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByText(/estimated range/i)).toBeInTheDocument()

    // Navigate onward through Why / Gaps / What-If / Share.
    await user.click(screen.getByRole('button', { name: /view detailed analysis/i }))
    expect(await screen.findByText(/why this value/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /see value gaps/i }))
    expect(await screen.findByText(/your value gaps/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /what if\?/i }))
    expect(await screen.findByText(/^what if\?$/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /share result/i }))
    const shareCard = await screen.findByTestId('share-card')
    expect(within(shareCard).getByText(/my market value/i)).toBeInTheDocument()
  }, 15000)

  it('shows an honest insufficient-evidence result for a domain with no benchmark data, without ever letting skills/certifications/achievements block progress', async () => {
    localStorage.clear()
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /discover your market value/i })[0])
    await user.click(screen.getByRole('button', { name: /working professional/i }))
    await user.click(screen.getByRole('button', { name: /^next/i }))

    // Domain selection: pick a newly-added domain that has no calibrated
    // benchmark — Legal is not one of the four demo-data domains.
    expect(screen.getByRole('button', { name: /legal/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /legal/i }))
    await user.click(screen.getByRole('button', { name: /^next/i }))

    // Education
    await user.selectOptions(screen.getByLabelText(/highest qualification/i), "Bachelor's Degree")
    await user.type(screen.getByLabelText(/institute \/ university/i), 'Delhi University')
    await user.type(screen.getByLabelText(/marks \/ cgpa/i), '7.5')
    await user.click(screen.getByRole('button', { name: /^next/i }))

    // Experience
    await user.selectOptions(screen.getByLabelText(/total experience/i), '3-5')
    await user.type(screen.getByLabelText(/current role/i), 'Legal Counsel')
    await user.click(screen.getByRole('button', { name: /^next/i }))

    // Skills — NIL: add nothing, Next must not be blocked.
    expect(screen.getByRole('button', { name: /^next/i })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /^next/i }))

    // Certifications — NIL
    await user.click(screen.getByRole('button', { name: /^next/i }))
    // Achievements — NIL
    await user.click(screen.getByRole('button', { name: /^next/i }))

    // Location
    await user.selectOptions(screen.getByLabelText(/current location/i), 'Mumbai')
    await user.click(screen.getByRole('button', { name: /analyze my value/i }))

    expect(await screen.findByText(/analyzing your profile/i)).toBeInTheDocument()
    expect(await screen.findByText(/insufficient data for legal/i, {}, { timeout: 5000 })).toBeInTheDocument()

    // No fabricated number anywhere, and no path into Why/Gaps/What-If/Share.
    expect(screen.queryByText(/lpa/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /view detailed analysis/i })).not.toBeInTheDocument()

    // The offered actions are real, working navigation, not dead ends.
    await user.click(screen.getByRole('button', { name: /change domain/i }))
    expect(await screen.findByText(/choose your professional domain/i)).toBeInTheDocument()
  }, 15000)

  it('supports going back from Your Role to Welcome', async () => {
    localStorage.clear()
    const user = userEvent.setup()
    render(<App />)

    // Welcome renders a mobile and a desktop variant simultaneously (CSS-hidden,
  // not DOM-removed, at any one viewport) — jsdom doesn't evaluate the media
  // query, so both are "visible" to a DOM query; the mobile one is first.
  await user.click(screen.getAllByRole('button', { name: /discover your market value/i })[0])
    expect(await screen.findByText(/what best describes you/i)).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /go back/i })[0])
    expect((await screen.findAllByText(/know your/i))[0]).toBeInTheDocument()
  })

  it('routes About, How it Works and FAQ to three distinct, non-duplicated screens', async () => {
    localStorage.clear()
    const user = userEvent.setup()
    render(<App />)

    // About — the creator/origin story only.
    await user.click(screen.getAllByRole('button', { name: /^about$/i })[0])
    expect(await screen.findByText(/why valpro exists/i)).toBeInTheDocument()
    expect(screen.getByText(/a simple question started it all/i)).toBeInTheDocument()
    // Must not contain How It Works' step list or FAQ's Q&A content.
    expect(screen.queryByText(/from your profile to a decision/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/questions people actually ask/i)).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /go back/i })[0])

    // How it Works — product mechanics only, no origin story.
    await user.click(screen.getAllByRole('button', { name: /how it works/i })[0])
    expect(await screen.findByText(/from your profile to a decision/i)).toBeInTheDocument()
    expect(screen.getByText(/no verified evidence, no invented number/i)).toBeInTheDocument()
    expect(screen.queryByText(/a simple question started it all/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/questions people actually ask/i)).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /go back/i })[0])

    // FAQ — practical Q&A only, no origin story, no step list.
    await user.click(screen.getAllByRole('button', { name: /^faq$/i })[0])
    expect(await screen.findByText(/questions people actually ask/i)).toBeInTheDocument()
    expect(screen.getByText(/is it a salary calculator/i)).toBeInTheDocument()
    expect(screen.queryByText(/a simple question started it all/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/from your profile to a decision/i)).not.toBeInTheDocument()
  })

  it('navigates Welcome -> Sign In -> Sign Up -> back -> Welcome, honestly explaining accounts aren\'t live yet', async () => {
    // No Supabase project is configured in this test environment (nor in
    // the actual deployed app today) — this exercises real navigation and
    // confirms the honest "not available yet" state renders, not a mocked
    // successful login (that's authService.mocked.test.ts's job).
    localStorage.clear()
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /^sign in$/i })[0])
    expect(await screen.findByRole('heading', { name: /^sign in$/i })).toBeInTheDocument()
    expect(screen.getByText(/accounts aren't available yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/accounts aren't available yet/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /go back/i }))
    expect(await screen.findByRole('heading', { name: /^sign in$/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /go back/i }))
    expect((await screen.findAllByText(/know your/i))[0]).toBeInTheDocument()
  })
})
