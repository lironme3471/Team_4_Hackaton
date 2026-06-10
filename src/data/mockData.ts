import type { CallHistoryEntry, LoopRecord } from '../types'

export const AGENT = {
  name: 'Maya Chen',
  initials: 'MC',
  team: 'Tier 2 Support',
}

/** Disposition codes the agent assigns during wrap-up (ACW). */
export const DISPOSITIONS = [
  'Resolved — first contact',
  'Resolved — follow-up scheduled',
  'Refund issued',
  'Escalated to specialist',
  'Callback requested',
  'Replacement dispatched',
  'No resolution — customer to call back',
]

/** Seed of recently closed calls shown in the Contact History list. */
export const SEED_HISTORY: CallHistoryEntry[] = [
  { id: 'ch-1', phone: '+1 (415) 555-0142', skill: 'Billing • Tier 2', direction: 'inbound', dateTime: '06/10/26 08:31', status: 'Closed' },
  { id: 'ch-2', phone: '+1 (628) 555-0193', skill: 'Billing • Tier 1', direction: 'inbound', dateTime: '06/10/26 08:30', status: 'Closed' },
  { id: 'ch-3', phone: '+1 (415) 555-0142', skill: 'Billing • Tier 2', direction: 'inbound', dateTime: '06/09/26 16:57', status: 'Closed' },
  { id: 'ch-4', phone: '+1 (773) 555-0164', skill: 'Billing • Disputes', direction: 'outbound', dateTime: '06/09/26 16:56', status: 'Closed' },
  { id: 'ch-5', phone: '+1 (628) 555-0193', skill: 'Billing • Tier 1', direction: 'inbound', dateTime: '06/08/26 10:49', status: 'Closed' },
]

/**
 * The billing call sitting in wrap-up. Carries the full context CX Loop
 * correlates: cross-channel history, connected system data, the AI-drafted
 * summary, and the predicted next issue.
 */
export const LOOP_RECORDS: LoopRecord[] = [
  {
    insightHeadline:
      'Billing dispute resolved, but autopay is still pointed at the expired card — a repeat charge failure is likely within 6 days.',
    liveTranscript: [
      { speaker: 'agent', text: 'Thanks for calling billing support, this is Maya. How can I help?' },
      { speaker: 'customer', text: 'Hi, I think I’ve been charged twice for my plan this month.' },
      { speaker: 'agent', text: 'I’m sorry to hear that. Let me pull up your account — can you confirm your email?' },
      { speaker: 'customer', text: 'Sure, it’s daniel at whitfield design dot com.' },
      { speaker: 'agent', text: 'Got it, thank you. One moment while I open your June invoice.' },
      { speaker: 'agent', text: 'Okay, I see two $49 charges dated June 1st — that’s a duplicate on our end.' },
      { speaker: 'customer', text: 'Right, that’s what I thought. And there’s a late fee too.' },
      { speaker: 'agent', text: 'I see the $12 late fee. I’ll waive that and refund one $49 charge right now.' },
      { speaker: 'customer', text: 'Thank you, I really appreciate it.' },
      { speaker: 'agent', text: 'All done — the refund posts in three to five business days and the fee is removed.' },
    ],
    interaction: {
      id: 'int-7781',
      contactId: 'c-001',
      channel: 'voice',
      direction: 'inbound',
      skill: 'Billing • Tier 2',
      status: 'wrap-up',
      startedAt: '2026-06-09T14:32:00Z',
      durationSec: 612,
      subject: 'Double charge on June invoice',
      contactRef: '#318024113',
      state: 'Wrap-up',
      transcriptPreview:
        'Customer was charged twice for the June Pro plan. Agent confirmed the duplicate, issued a $49 refund, and waived the late fee.',
      messages: [
        { id: 'm1', from: 'customer', author: 'Daniel Whitfield', text: 'Hi — I just noticed I was charged $98 for my June plan but it should only be $49. Looks like I got billed twice.', time: '11 minutes ago' },
        { id: 'm2', from: 'agent', author: 'Maya Chen', text: 'Hi Daniel, thanks for flagging that. Let me pull up your June invoice right now.', time: '10 minutes ago' },
        { id: 'm3', from: 'agent', author: 'Maya Chen', text: 'You’re right — I can see two identical $49 charges on June 1st. That’s a duplicate on our side. I’ll refund one of them in full.', time: '8 minutes ago' },
        { id: 'm4', from: 'customer', author: 'Daniel Whitfield', text: 'Thank you. There was also a late fee added — that shouldn’t be there.', time: '6 minutes ago' },
        { id: 'm5', from: 'agent', author: 'Maya Chen', text: 'Good catch. I’ve waived the $12 late fee as well. You’ll see the $49 refund in 3–5 business days. Anything else I can help with?', time: '3 minutes ago' },
      ],
      sentiment: 'negative',
    },
    contact: {
      id: 'c-001',
      name: 'Daniel Whitfield',
      company: 'Whitfield Design Co.',
      email: 'daniel@whitfielddesign.com',
      phone: '+1 (415) 555-0142',
      avatarColor: '#2563eb',
      tier: 'Premium',
      since: '2021',
    },
    history: [
      {
        id: 'h-1',
        channel: 'email',
        date: '2026-05-28',
        topic: 'Plan upgrade to Pro',
        outcome: 'Upgraded; prorated invoice sent',
        sentiment: 'positive',
        agent: 'R. Patel',
      },
      {
        id: 'h-2',
        channel: 'chat',
        date: '2026-04-15',
        topic: 'Card expiring soon',
        outcome: 'Advised to update payment method',
        sentiment: 'neutral',
        agent: 'System',
      },
      {
        id: 'h-3',
        channel: 'voice',
        date: '2026-02-02',
        topic: 'Login lockout',
        outcome: 'Reset MFA, restored access',
        sentiment: 'neutral',
        agent: 'M. Chen',
      },
    ],
    connected: [
      { source: 'Billing', label: 'June invoice', value: '$98.00 → $49.00 refunded', status: 'ok' },
      { source: 'Billing', label: 'Payment method', value: 'Visa •4417 — expired 05/26', status: 'danger' },
      { source: 'Subscription', label: 'Plan', value: 'Pro (annual) • renews 03/2027', status: 'ok' },
      { source: 'Billing', label: 'Autopay', value: 'Enabled — next run 06/15', status: 'warn' },
    ],
    summary: {
      greeting: 'Hi Daniel, thanks for your patience today — here’s a recap of our call.',
      resolved: [
        'Confirmed the duplicate $49 charge on your June invoice.',
        'Issued a full $49 refund (3–5 business days to your Visa).',
        'Waived the $12 late fee applied in error.',
      ],
      nextSteps: [
        'Your refund confirmation will arrive by email within 24 hours.',
        'Your account is in good standing — no further action needed on the dispute.',
      ],
      followUps: [
        {
          id: 'f-1',
          text: 'Update the payment method on file — the card ending 4417 expired 05/26.',
          owner: 'Customer',
          due: 'Before 06/15',
          done: false,
        },
        {
          id: 'f-2',
          text: 'Agent to verify refund posted and close the dispute ticket.',
          owner: 'Agent',
          due: '06/13',
          done: false,
        },
      ],
      closing: 'We appreciate your business since 2021. Reply to this message any time if anything looks off.',
    },
    predictions: [
      {
        title: 'Autopay will fail on the next billing run',
        likelihood: 86,
        reasoning:
          'Autopay is enabled and scheduled for 06/15, but the only payment method on file (Visa •4417) expired 05/26. The customer was already warned about this in April but did not update it.',
        suggestedAction:
          'Proactively include a one-tap "Update card" link in the summary and flag the account for a payment-method reminder on 06/13.',
      },
      {
        title: 'Refund-timing follow-up contact',
        likelihood: 41,
        reasoning:
          'Negative sentiment on a billing issue plus a 3–5 day refund window historically drives a "where is my refund?" check-in around day 3.',
        suggestedAction: 'Send a proactive "refund is on its way" note on 06/12 to pre-empt the call.',
      },
    ],
  },
  {
    insightHeadline:
      'Service restored, but the replacement card is from the same bank and the bakery runs tight month-start cash flow — the 07/01 autopay charge is at real risk of declining again.',
    liveTranscript: [
      { speaker: 'agent', text: 'Billing support, this is Maya speaking. How can I help today?' },
      { speaker: 'customer', text: 'My account is suspended and my bakery’s payment system just went offline.' },
      { speaker: 'agent', text: 'I’m sorry about that — let me take a look right away.' },
      { speaker: 'customer', text: 'Please hurry, we have customers waiting at the register.' },
      { speaker: 'agent', text: 'I see it — your June 7th payment of $79 was declined, which suspended the account.' },
      { speaker: 'agent', text: 'I’m reactivating you now… okay, service should be coming back online.' },
      { speaker: 'customer', text: 'Oh good, it’s back. Thank you.' },
      { speaker: 'agent', text: 'To clear the balance, can we take payment on a current card?' },
      { speaker: 'customer', text: 'Yes, use my new Mastercard ending 8821.' },
      { speaker: 'agent', text: 'Perfect — $79 paid, receipt on the way, and I’ve set autopay to that new card.' },
    ],
    interaction: {
      id: 'int-7782',
      contactId: 'c-002',
      channel: 'voice',
      direction: 'inbound',
      skill: 'Billing • Tier 1',
      status: 'wrap-up',
      startedAt: '2026-06-10T09:05:00Z',
      durationSec: 421,
      subject: 'Card declined — service suspended',
      contactRef: '#318024207',
      state: 'Wrap-up',
      transcriptPreview:
        'A declined payment auto-suspended the account. Agent reactivated service, took payment on an updated card, and re-enabled autopay.',
      messages: [
        { id: 'm1', from: 'customer', author: 'Sofia Marchetti', text: 'My account is suspended and my bakery’s payment system is offline — what happened?', time: '9 minutes ago' },
        { id: 'm2', from: 'agent', author: 'Maya Chen', text: 'I’m sorry about that, Sofia. I can see your 06/07 payment of $79 was declined, which automatically suspended the account.', time: '8 minutes ago' },
        { id: 'm3', from: 'agent', author: 'Maya Chen', text: 'I’ve reactivated you right now, so service is coming back online. Can we take payment on a current card?', time: '6 minutes ago' },
        { id: 'm4', from: 'customer', author: 'Sofia Marchetti', text: 'Yes — please use my new Mastercard ending 8821.', time: '4 minutes ago' },
        { id: 'm5', from: 'agent', author: 'Maya Chen', text: 'Done — $79 paid and a receipt is on its way. I’ve set autopay to the new card so this doesn’t happen again.', time: '1 minute ago' },
      ],
      sentiment: 'negative',
    },
    contact: {
      id: 'c-002',
      name: 'Sofia Marchetti',
      company: 'Marchetti Bakery',
      email: 'sofia@marchettibakery.com',
      phone: '+1 (628) 555-0193',
      avatarColor: '#0d9488',
      tier: 'Standard',
      since: '2022',
    },
    history: [
      {
        id: 'h-1',
        channel: 'voice',
        date: '2026-03-12',
        topic: 'Late payment reminder',
        outcome: 'Paid balance over the phone',
        sentiment: 'neutral',
        agent: 'System',
      },
      {
        id: 'h-2',
        channel: 'email',
        date: '2026-01-20',
        topic: 'Invoice line-item question',
        outcome: 'Explained charges; resolved',
        sentiment: 'positive',
        agent: 'R. Patel',
      },
    ],
    connected: [
      { source: 'Billing', label: 'Last payment', value: '$79.00 declined 06/07 (insufficient funds)', status: 'danger' },
      { source: 'Billing', label: 'Account status', value: 'Suspended → Reactivated 06/10', status: 'ok' },
      { source: 'Billing', label: 'Payment method', value: 'Mastercard •8821 — updated 06/10', status: 'ok' },
      { source: 'Subscription', label: 'Plan', value: 'Business (monthly) • renews 07/01', status: 'warn' },
    ],
    summary: {
      greeting: 'Hi Sofia, thanks for sorting this out with me — here’s a quick recap.',
      resolved: [
        'Found that the 06/07 payment of $79.00 was declined, which suspended the account.',
        'Reactivated your account immediately — service is fully restored.',
        'Processed payment on your updated Mastercard ending 8821.',
      ],
      nextSteps: [
        'A paid receipt is on its way to your email.',
        'Autopay is re-enabled on the new card for future invoices.',
      ],
      followUps: [
        {
          id: 'f-1',
          text: 'Confirm the bakery’s POS reconnected after reactivation.',
          owner: 'Customer',
          due: 'Today',
          done: false,
        },
        {
          id: 'f-2',
          text: 'Agent to monitor the 07/01 invoice for a successful charge.',
          owner: 'Agent',
          due: '07/01',
          done: false,
        },
      ],
      closing: 'Thanks for being with us since 2022 — reach out any time.',
    },
    predictions: [
      {
        title: 'Autopay declines again on 07/01',
        likelihood: 58,
        reasoning:
          'The 06/07 decline was an insufficient-funds response, and the business runs tight cash flow at the start of the month. The replacement card is from the same bank, so the 07/01 autopay charge could decline again.',
        suggestedAction:
          'Offer to move the billing date to the 15th to align with the bakery’s cash flow, and turn on a pre-charge reminder.',
      },
      {
        title: 'Frustration-driven plan downgrade',
        likelihood: 34,
        reasoning:
          'A suspension over a single missed payment often triggers a downgrade request on the next contact, especially for price-sensitive small businesses.',
        suggestedAction: 'Proactively mention a lower-cost annual plan that avoids monthly decline risk.',
      },
    ],
  },
  {
    insightHeadline:
      'Promo-end sticker shock was only deferred by a 3-month loyalty credit — when the bill returns to $59 on 09/01, this 6-year account is at high risk of cancelling.',
    liveTranscript: [
      { speaker: 'agent', text: 'Thanks for calling, this is Maya in billing. How can I help?' },
      { speaker: 'customer', text: 'My bill doubled this month and nobody warned me — it went from $29 to $59.' },
      { speaker: 'agent', text: 'I understand the frustration. Let me check what changed on your account.' },
      { speaker: 'customer', text: 'I’ve been a loyal customer for years, this feels unfair.' },
      { speaker: 'agent', text: 'You’re right that it jumped — your 12-month promotional rate ended on May 31st.' },
      { speaker: 'customer', text: 'So it’s just $59 now? I’m honestly considering cancelling.' },
      { speaker: 'agent', text: 'I’d really like to keep you. Given your six years with us, I can apply a loyalty credit.' },
      { speaker: 'agent', text: 'That’s $20 off per month for the next three cycles, bringing you to $39.' },
      { speaker: 'customer', text: 'Okay, that’s better. What happens after the three months?' },
      { speaker: 'agent', text: 'We’ll review your options before then — I’ll schedule a call so there are no surprises.' },
    ],
    interaction: {
      id: 'int-7783',
      contactId: 'c-003',
      channel: 'voice',
      direction: 'inbound',
      skill: 'Billing • Disputes',
      status: 'wrap-up',
      startedAt: '2026-06-10T09:40:00Z',
      durationSec: 538,
      subject: 'Bill jumped after promo ended',
      contactRef: '#318024256',
      state: 'Wrap-up',
      transcriptPreview:
        'Customer’s 12-month promo expired and the bill doubled to $59. Agent explained the change and applied a 3-month loyalty discount to retain the account.',
      messages: [
        { id: 'm1', from: 'customer', author: 'Olivia Bennett', text: 'My bill doubled this month — it was $29 and now it’s $59. Nobody told me. I’m thinking of cancelling.', time: '12 minutes ago' },
        { id: 'm2', from: 'agent', author: 'Maya Chen', text: 'I understand the frustration, Olivia. Your 12-month promotional rate ended on May 31st, which is why it returned to the standard $59.', time: '10 minutes ago' },
        { id: 'm3', from: 'agent', author: 'Maya Chen', text: 'You’ve been with us six years, so I can apply a loyalty discount of $20 a month for the next three cycles — that brings you to $39.', time: '7 minutes ago' },
        { id: 'm4', from: 'customer', author: 'Olivia Bennett', text: 'Okay, that helps. What happens after three months?', time: '4 minutes ago' },
        { id: 'm5', from: 'agent', author: 'Maya Chen', text: 'We’ll review your options before then — I’ll set up a quick call so there are no surprises.', time: '2 minutes ago' },
      ],
      sentiment: 'negative',
    },
    contact: {
      id: 'c-003',
      name: 'Olivia Bennett',
      email: 'olivia.bennett@fastmail.com',
      phone: '+1 (773) 555-0164',
      avatarColor: '#9333ea',
      tier: 'Premium',
      since: '2020',
    },
    history: [
      {
        id: 'h-1',
        channel: 'chat',
        date: '2025-06-01',
        topic: 'Promo renewal',
        outcome: 'Applied 12-month promotional rate',
        sentiment: 'positive',
        agent: 'System',
      },
      {
        id: 'h-2',
        channel: 'voice',
        date: '2024-11-03',
        topic: 'Billing question',
        outcome: 'Clarified taxes and fees',
        sentiment: 'neutral',
        agent: 'M. Chen',
      },
    ],
    connected: [
      { source: 'Billing', label: 'Current bill', value: '$59.00 (promo ended 05/31)', status: 'warn' },
      { source: 'Billing', label: 'Applied credit', value: '−$20.00/mo for 3 cycles → $39.00', status: 'ok' },
      { source: 'Subscription', label: 'Plan', value: 'Standard (monthly) • customer since 2020', status: 'ok' },
      { source: 'CRM', label: 'Loyalty', value: '6 years • NPS 9 • no prior cancels', status: 'ok' },
    ],
    summary: {
      greeting: 'Hi Olivia, thanks for the call — here’s what we covered.',
      resolved: [
        'Explained your bill rose from $29 to $59 because the 12-month promo ended 05/31.',
        'Applied a loyalty discount of $20/month for the next 3 billing cycles.',
        'Confirmed your effective rate is $39/month through 08/31.',
      ],
      nextSteps: [
        'Your next invoice will reflect the $39 rate.',
        'We’ll review your options together before the discount ends.',
      ],
      followUps: [
        {
          id: 'f-1',
          text: 'Customer to weigh an annual plan vs. monthly before 08/31.',
          owner: 'Customer',
          due: 'Before 08/31',
          done: false,
        },
        {
          id: 'f-2',
          text: 'Agent to schedule a rate-review call before the loyalty credit expires.',
          owner: 'Agent',
          due: '08/24',
          done: false,
        },
      ],
      closing: 'We value your 6 years with us, Olivia — talk soon.',
    },
    predictions: [
      {
        title: 'Churn when the $20 loyalty credit expires',
        likelihood: 71,
        reasoning:
          'The price objection was strong and only deferred by a temporary credit. When the bill returns to $59 on 09/01, cancellation risk spikes — the top churn pattern for post-promo accounts.',
        suggestedAction:
          'Flag for a retention rate-review on 08/24 and prepare an annual-plan offer that locks in a lower effective rate.',
      },
      {
        title: 'Callback disputing taxes and fees',
        likelihood: 29,
        reasoning:
          'Customers surprised by a base-rate increase frequently call again questioning the added taxes and fees on the higher bill.',
        suggestedAction: 'Include a clear line-item breakdown of taxes and fees in the summary.',
      },
    ],
  },
]
