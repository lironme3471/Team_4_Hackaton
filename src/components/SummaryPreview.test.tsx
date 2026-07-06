import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryPreview } from './SummaryPreview'
import { clearFeedback } from '../lib/feedback'
import type { Contact, LoopSummary } from '../types'

beforeEach(() => clearFeedback())

const contact: Contact = {
  id: 'c-test',
  name: 'Daniel Whitfield',
  company: 'Whitfield Design Co.',
  email: 'daniel@whitfielddesign.com',
  phone: '+1 (415) 555-0142',
  avatarColor: '#2563eb',
  tier: 'Premium',
  since: '2021',
}

const summary: LoopSummary = {
  greeting: 'Hi Daniel, here is a recap.',
  resolved: ['Confirmed the duplicate $49 charge.'],
  nextSteps: ['Refund confirmation will arrive by email.'],
  followUps: [],
  closing: 'Thanks for your business.',
}

const tips = ['Update the card ending 4417 before June 15.', 'Your $49 refund is on its way.']

const survey = {
  url: 'https://cxloop.com/s/318024113',
  question: 'How would you rate today\'s help with "Double charge on June invoice"?',
  resolved: 'Did we fully resolve it?',
  duration: '20 seconds',
}

describe('SummaryPreview channel templates', () => {
  it('renders the Outlook email template for the email channel, with tips', () => {
    render(<SummaryPreview channel="email" contact={contact} summary={summary} tips={tips} interactionId="int-test" onClose={vi.fn()} />)
    expect(screen.getByText(/Recap of your call/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(contact.email))).toBeInTheDocument()
    expect(screen.getByText(/Looking ahead — a few tips/i)).toBeInTheDocument()
    expect(screen.getByText(/Update the card ending 4417/i)).toBeInTheDocument()
  })

  it('renders the SMS template with a short message and segment counter', () => {
    render(<SummaryPreview channel="sms" contact={contact} summary={summary} tips={tips} interactionId="int-test" onClose={vi.fn()} />)
    expect(screen.getByText(/Text Message · SMS/i)).toBeInTheDocument()
    // Only the single top tip is appended to SMS to keep it short.
    expect(screen.getByText(/Tip: Update the card ending 4417/i)).toBeInTheDocument()
    expect(screen.getByText(/SMS segment/i)).toBeInTheDocument()
  })

  it('renders transcript and recording as CX1 view links in email preview', () => {
    render(
      <SummaryPreview
        channel="email"
        contact={contact}
        summary={summary}
        tips={tips}
        interactionId="int-test"
        transcript={[
          { speaker: 'agent', text: 'Hello!' },
          { speaker: 'customer', text: 'Hi there.' },
        ]}
        includeRecording
        onClose={vi.fn()}
      />,
    )

    const transcriptLinks = screen.getAllByRole('link', { name: /View transcript in CX1/i })
    const recordingLinks = screen.getAllByRole('link', { name: /View recording in CX1/i })

    expect(transcriptLinks[0]).toHaveAttribute('href', expect.stringContaining('/interactions/int-test/transcript'))
    expect(recordingLinks[0]).toHaveAttribute('href', expect.stringContaining('/interactions/int-test/recording'))
    expect(screen.queryByText(/call-transcript-int-test\.txt/i)).not.toBeInTheDocument()
  })

  it('renders transcript and recording as CX1 view links in SMS preview', () => {
    render(
      <SummaryPreview
        channel="sms"
        contact={contact}
        summary={summary}
        tips={tips}
        interactionId="int-test"
        transcript={[{ speaker: 'agent', text: 'Thanks for calling.' }]}
        includeRecording
        onClose={vi.fn()}
      />,
    )

    const links = screen.getAllByRole('link')
    expect(links.some((l) => l.getAttribute('href')?.includes('/interactions/int-test/transcript'))).toBe(true)
    expect(links.some((l) => l.getAttribute('href')?.includes('/interactions/int-test/recording'))).toBe(true)
  })

  it('renders transcript and recording as CX1 view links in WhatsApp preview', () => {
    render(
      <SummaryPreview
        channel="whatsapp"
        contact={contact}
        summary={summary}
        tips={tips}
        interactionId="int-test"
        transcript={[{ speaker: 'agent', text: 'Thanks for calling.' }]}
        includeRecording
        onClose={vi.fn()}
      />,
    )

    const links = screen.getAllByRole('link')
    expect(links.some((l) => l.getAttribute('href')?.includes('/interactions/int-test/transcript'))).toBe(true)
    expect(links.some((l) => l.getAttribute('href')?.includes('/interactions/int-test/recording'))).toBe(true)
  })

  it('renders the WhatsApp template with a tips section', () => {
    render(<SummaryPreview channel="whatsapp" contact={contact} summary={summary} tips={tips} interactionId="int-test" onClose={vi.fn()} />)
    expect(screen.getByText(/business account/i)).toBeInTheDocument()
    expect(screen.getByText(/A couple of tips/i)).toBeInTheDocument()
    expect(screen.getByText(/Your \$49 refund is on its way/i)).toBeInTheDocument()
  })

  it('omits the tips section when there are no tips', () => {
    render(<SummaryPreview channel="email" contact={contact} summary={summary} tips={[]} interactionId="int-test" onClose={vi.fn()} />)
    expect(screen.queryByText(/Looking ahead/i)).not.toBeInTheDocument()
  })

  it('defaults to the SMS template for unknown/other channels', () => {
    render(<SummaryPreview channel="chat" contact={contact} summary={summary} tips={tips} interactionId="int-test" onClose={vi.fn()} />)
    expect(screen.getByText(/Text Message · SMS/i)).toBeInTheDocument()
  })

  it('includes the tailored feedback survey in the email template', () => {
    render(<SummaryPreview channel="email" contact={contact} summary={summary} tips={tips} survey={survey} interactionId="int-test" onClose={vi.fn()} />)
    expect(screen.getByText(/Quick feedback · 20 seconds/i)).toBeInTheDocument()
    expect(screen.getByText(/Double charge on June invoice/i)).toBeInTheDocument()
    // The survey is interactive (no dead external link).
    expect(screen.queryByRole('link', { name: /feedback/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit feedback/i })).toBeInTheDocument()
  })

  it('captures a survey response and confirms, without navigating away', async () => {
    const user = userEvent.setup()
    render(<SummaryPreview channel="email" contact={contact} summary={summary} tips={tips} survey={survey} interactionId="int-test" onClose={vi.fn()} />)

    // Submit is disabled until a rating is chosen.
    expect(screen.getByRole('button', { name: /Submit feedback/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /4 stars/i }))
    await user.click(screen.getByRole('button', { name: /👍 Yes/i }))
    await user.click(screen.getByRole('button', { name: /Submit feedback/i }))

    expect(screen.getByText(/Thanks for your feedback/i)).toBeInTheDocument()
    expect(screen.getByText(/4\/5/)).toBeInTheDocument()
  })

  it('renders a clickable survey link in the SMS message that opens the in-app survey', async () => {
    const user = userEvent.setup()
    render(<SummaryPreview channel="sms" contact={contact} summary={summary} tips={tips} survey={survey} interactionId="int-test" onClose={vi.fn()} />)
    expect(screen.getByText(/Rate us \(20 seconds\):/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: survey.url }))
    expect(screen.getByRole('button', { name: /Submit feedback/i })).toBeInTheDocument()
  })

  it('renders a clickable survey link in the WhatsApp message that opens the in-app survey', async () => {
    const user = userEvent.setup()
    render(<SummaryPreview channel="whatsapp" contact={contact} summary={summary} tips={tips} survey={survey} interactionId="int-test" onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: survey.url }))
    expect(screen.getByRole('button', { name: /Submit feedback/i })).toBeInTheDocument()
  })
})
