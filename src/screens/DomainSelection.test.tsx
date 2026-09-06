import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../state/AppContext'
import { DomainSelection } from './DomainSelection'

function renderDomainSelection() {
  return render(
    <AppProvider>
      <DomainSelection />
    </AppProvider>,
  )
}

describe('DomainSelection — broad taxonomy stays usable, not overwhelming', () => {
  it('renders domains grouped under category headings', () => {
    renderDomainSelection()
    expect(screen.getByText('Technology & Data')).toBeInTheDocument()
    expect(screen.getByText('Career Stage')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /technology \/ it/i })).toBeInTheDocument()
  })

  it('includes every domain newly added this phase', () => {
    renderDomainSelection()
    expect(screen.getByRole('button', { name: /^business/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^design/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /non-profit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /career switcher/i })).toBeInTheDocument()
  })

  it('the search field filters the list down to matching domains only', async () => {
    const user = userEvent.setup()
    renderDomainSelection()

    await user.type(screen.getByLabelText(/search domains/i), 'legal')

    expect(screen.getByRole('button', { name: /^legal/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /technology \/ it/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Career Stage')).not.toBeInTheDocument()
  })

  it('shows a helpful message, not a blank screen, when nothing matches', async () => {
    const user = userEvent.setup()
    renderDomainSelection()

    await user.type(screen.getByLabelText(/search domains/i), 'zzzznotadomain')

    expect(screen.getByText(/no domain matches/i)).toBeInTheDocument()
  })
})
