import { describe, it, expect, beforeEach } from 'vitest'
import { submitFeedback, getFeedback, clearFeedback, type CustomerFeedback } from './feedback'

const sample = (over: Partial<CustomerFeedback> = {}): CustomerFeedback => ({
  interactionId: 'int-1',
  customer: 'Daniel Whitfield',
  channel: 'email',
  rating: 5,
  resolved: 'yes',
  submittedAt: '2026-06-15T10:00:00.000Z',
  ...over,
})

describe('feedback receiver (placeholder)', () => {
  beforeEach(() => clearFeedback())

  it('receives a submission and reads it back', () => {
    submitFeedback(sample())
    const all = getFeedback()
    expect(all).toHaveLength(1)
    expect(all[0]).toMatchObject({ interactionId: 'int-1', rating: 5, resolved: 'yes' })
  })

  it('scopes feedback to a given interaction', () => {
    submitFeedback(sample({ interactionId: 'int-1' }))
    submitFeedback(sample({ interactionId: 'int-2', rating: 3 }))
    expect(getFeedback('int-1')).toHaveLength(1)
    expect(getFeedback('int-2')[0].rating).toBe(3)
    expect(getFeedback()).toHaveLength(2)
  })

  it('clears received feedback', () => {
    submitFeedback(sample())
    clearFeedback()
    expect(getFeedback()).toHaveLength(0)
  })
})
