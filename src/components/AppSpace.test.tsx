import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppSpace, type AppSpaceProps } from './AppSpace'
import { LOOP_RECORDS } from '../data/mockData'

// Daniel — both predictions carry a customer-friendly tip.
const danielRecord = LOOP_RECORDS[0]
// Sofia — one prediction (the "downgrade") is sensitive and has NO customerTip.
const sofiaRecord = LOOP_RECORDS[1]

function makeProps(overrides: Partial<AppSpaceProps> = {}): AppSpaceProps {
  const record = overrides.record ?? danielRecord
  return {
    phase: 'acw',
    record,
    summary: record.summary,
    sent: false,
    disposition: '',
    dispNotes: '',
    onChange: vi.fn(),
    onAddFollowUp: vi.fn(),
    onSend: vi.fn(),
    onDispositionChange: vi.fn(),
    onDispNotesChange: vi.fn(),
    onSaveClose: vi.fn(),
    onSaveRedial: vi.fn(),
    onCallComplete: vi.fn(),
    ...overrides,
  }
}

describe('AppSpace wrap-up — AI insights in the Loop summary', () => {
  it('shows customer-friendly tips derived from the predictions', () => {
    render(<AppSpace {...makeProps()} />)
    const tips = within(screen.getByTestId('customer-tips'))
    expect(tips.getByText(/Looking ahead · AI tips for Daniel/i)).toBeInTheDocument()
    expect(tips.getByText(/Visa ending 4417/i)).toBeInTheDocument()
    expect(tips.getByText(/refund is already on its way/i)).toBeInTheDocument()
  })

  it('keeps sensitive predictions out of the customer tips but still shows them internally', () => {
    render(<AppSpace {...makeProps({ record: sofiaRecord, summary: sofiaRecord.summary })} />)
    const tips = within(screen.getByTestId('customer-tips'))
    // The shareable tip is present...
    expect(tips.getByText(/shift your billing date to the 15th/i)).toBeInTheDocument()
    // ...but the sensitive "downgrade" insight is NOT surfaced to the customer.
    expect(tips.queryByText(/downgrade/i)).not.toBeInTheDocument()
    // It remains visible in the internal AI insight panel.
    expect(screen.getByText(/Frustration-driven plan downgrade/i)).toBeInTheDocument()
  })
})

describe('AppSpace wrap-up — preview + send flow', () => {
  it('opens the email preview before sending without calling onSend', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<AppSpace {...makeProps({ onSend })} />)

    await user.click(screen.getByRole('button', { name: /^Preview$/i }))

    expect(screen.getByText(/Recap of your call/i)).toBeInTheDocument()
    expect(onSend).not.toHaveBeenCalled()
  })

  it('sends on the selected channel and opens the matching preview', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<AppSpace {...makeProps({ onSend })} />)

    // Switch the channel to WhatsApp, then send.
    await user.click(screen.getByTitle('WhatsApp'))
    await user.click(screen.getByRole('button', { name: /Send Loop summary/i }))

    expect(onSend).toHaveBeenCalledWith('whatsapp')
    expect(screen.getByText(/business account/i)).toBeInTheDocument()
  })

  it('exposes a Preview summary action after the summary is sent', async () => {
    const user = userEvent.setup()
    render(<AppSpace {...makeProps({ sent: true })} />)

    expect(screen.getByText(/Summary sent via Email/i)).toBeInTheDocument()
    const previewBtn = screen.getByRole('button', { name: /Preview summary/i })
    await user.click(previewBtn)

    expect(screen.getByText(/Recap of your call/i)).toBeInTheDocument()
  })
})
