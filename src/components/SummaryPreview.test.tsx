import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryPreview } from './SummaryPreview'
import type { Contact, LoopSummary } from '../types'

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
})
