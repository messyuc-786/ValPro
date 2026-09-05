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
})
