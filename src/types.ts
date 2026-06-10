export type Channel = 'voice' | 'chat' | 'email' | 'sms' | 'whatsapp'

export type Sentiment = 'positive' | 'neutral' | 'negative'

/** Agent state, mirrored in the top-bar status pill. */
export type AgentPhase = 'available' | 'oncall' | 'acw'

export type CallDirection = 'inbound' | 'outbound'

/** A closed call shown in the Contact History list. */
export interface CallHistoryEntry {
  id: string
  phone: string
  skill: string
  direction: CallDirection
  dateTime: string // e.g. "06/10/26 08:31"
  status: 'Closed'
}

export interface Message {
  id: string
  from: 'customer' | 'agent' | 'system'
  author: string
  text: string
  time: string // human label e.g. "8 minutes ago"
}

/** One utterance in the live, streamed call transcript. */
export interface TranscriptLine {
  speaker: 'agent' | 'customer'
  text: string
}

export interface Contact {
  id: string
  name: string
  company?: string
  email: string
  phone: string
  avatarColor: string
  tier: 'Standard' | 'Premium' | 'Enterprise'
  since: string // year the customer joined
}

/** A single past interaction in the contact's history. */
export interface HistoryItem {
  id: string
  channel: Channel
  date: string // ISO date
  topic: string
  outcome: string
  sentiment: Sentiment
  agent: string
}

/** Connected system data the platform correlates for the contact. */
export interface ConnectedRecord {
  source: 'Billing' | 'Orders' | 'Subscription' | 'Device' | 'CRM'
  label: string
  value: string
  status?: 'ok' | 'warn' | 'danger'
}

export interface FollowUp {
  id: string
  text: string
  owner: 'Agent' | 'Customer' | 'System'
  due?: string
  done: boolean
}

/** AI-generated next-issue prediction. */
export interface Prediction {
  title: string
  likelihood: number // 0-100
  reasoning: string
  suggestedAction: string
}

/** The AI-drafted post-interaction summary the agent reviews. */
export interface LoopSummary {
  greeting: string
  resolved: string[]
  nextSteps: string[]
  followUps: FollowUp[]
  closing: string
}

/** A live/just-completed interaction shown in the center panel. */
export interface Interaction {
  id: string
  contactId: string
  channel: Channel
  direction: CallDirection
  skill: string
  status: 'active' | 'wrap-up' | 'closed'
  startedAt: string
  durationSec: number
  subject: string
  contactRef: string // interaction reference number
  state: 'Pending' | 'Active' | 'Wrap-up'
  transcriptPreview: string
  messages: Message[]
  sentiment: Sentiment
}

/** Everything CX Loop needs for one contact's review session. */
export interface LoopRecord {
  interaction: Interaction
  contact: Contact
  history: HistoryItem[]
  connected: ConnectedRecord[]
  summary: LoopSummary
  predictions: Prediction[]
  insightHeadline: string
  liveTranscript: TranscriptLine[]
}
