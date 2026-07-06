import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppSpace, type AppSpaceProps } from './AppSpace'
import { LOOP_RECORDS } from '../data/mockData'
import { clearFeedback } from '../lib/feedback'

beforeEach(() => clearFeedback())

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

  it('adds an AI suggested action and confirms with a disabled "Added" state', async () => {
    const user = userEvent.setup()
    const onAddFollowUp = vi.fn()
    render(<AppSpace {...makeProps({ onAddFollowUp })} />)

    const addButtons = screen.getAllByRole('button', { name: /\+ Add/i })
    await user.click(addButtons[0])

    expect(onAddFollowUp).toHaveBeenCalledTimes(1)
    const added = screen.getByRole('button', { name: /✓ Added/i })
    expect(added).toBeDisabled()
  })

  it('shows a brief, conversation-tailored feedback survey with a link', () => {
    render(<AppSpace {...makeProps()} />)
    const surveyBox = within(screen.getByTestId('feedback-survey'))
    // Tailored to this call's subject.
    expect(surveyBox.getByText(new RegExp(danielRecord.interaction.subject, 'i'))).toBeInTheDocument()
    // Kept to two short questions to encourage a response.
    expect(surveyBox.getByText(/Did we fully resolve it\?/i)).toBeInTheDocument()
    expect(surveyBox.getByText(/cxloop\.com\/s\//i)).toBeInTheDocument()
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

  it('keeps include toggles available on WhatsApp and shows CX1 links in preview', async () => {
    const user = userEvent.setup()
    render(<AppSpace {...makeProps()} />)

    await user.click(screen.getByTitle('WhatsApp'))
    await user.click(screen.getByLabelText(/Call transcript/i))
    await user.click(screen.getByLabelText(/Call recording/i))
    await user.click(screen.getByRole('button', { name: /^Preview$/i }))

    const links = screen.getAllByRole('link')
    expect(links.some((l) => l.getAttribute('href')?.includes('/transcript'))).toBe(true)
    expect(links.some((l) => l.getAttribute('href')?.includes('/recording'))).toBe(true)
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

describe('AppSpace wrap-up — customer feedback loop', () => {
  it('shows an awaiting placeholder until feedback is received', () => {
    render(<AppSpace {...makeProps()} />)
    expect(screen.getByText(/Awaiting the customer's response/i)).toBeInTheDocument()
  })

  it('records feedback submitted from the preview and surfaces it to the agent', async () => {
    const user = userEvent.setup()
    render(<AppSpace {...makeProps()} />)

    // Customer opens the recap preview and submits the survey.
    await user.click(screen.getByRole('button', { name: /^Preview$/i }))
    await user.click(screen.getByRole('button', { name: /^5 stars$/i }))
    await user.click(screen.getByRole('button', { name: /👍 Yes/i }))
    await user.click(screen.getByRole('button', { name: /Submit feedback/i }))

    // Loop closed: the agent panel now shows the received feedback.
    expect(screen.getByLabelText(/5 of 5 stars/i)).toBeInTheDocument()
    expect(screen.queryByText(/Awaiting the customer's response/i)).not.toBeInTheDocument()
  })
})
