import type { LoopRecord } from '../types'

const SURVEY_BASE = 'https://cxloop.com/s'

/** A concise, conversation-tailored feedback survey attached to the recap. */
export interface Survey {
  url: string
  /** Primary one-tap CSAT question, tailored to what this call was about. */
  question: string
  /** Quick yes/no resolution check. */
  resolved: string
  /** Estimated time-to-complete, surfaced to encourage a response. */
  duration: string
}

/**
 * Builds a brief survey keyed to the interaction. Kept to two one-tap
 * questions so it reads as ~20 seconds and maximizes response rate.
 */
export function buildSurvey(record: LoopRecord): Survey {
  const ref = record.interaction.contactRef.replace(/[^0-9]/g, '')
  return {
    url: `${SURVEY_BASE}/${ref}`,
    question: `How would you rate today's help with "${record.interaction.subject}"?`,
    resolved: 'Did we fully resolve it?',
    duration: '20 seconds',
  }
}
