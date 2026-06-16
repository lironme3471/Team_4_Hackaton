import type { TranscriptLine } from '../types'

export type SentimentArc =
  | 'recovered'   // unhappy → happy
  | 'improved'    // unhappy → neutral
  | 'frustrated'  // unhappy throughout
  | 'delighted'   // happy throughout
  | 'positive'    // neutral/happy → happy
  | 'standard'    // no sentiment data

export function getSentimentArc(lines: TranscriptLine[]): SentimentArc {
  const customerLines = lines.filter((l) => l.speaker === 'customer' && l.sentiment)
  if (customerLines.length === 0) return 'standard'
  const first = customerLines[0].sentiment as string
  const last = customerLines[customerLines.length - 1].sentiment as string
  if (first === 'unhappy' && last === 'happy') return 'recovered'
  if (first === 'unhappy' && last === 'neutral') return 'improved'
  if (first === 'unhappy') return 'frustrated'
  if (first === 'happy' && last === 'happy') return 'delighted'
  if (last === 'happy') return 'positive'
  return 'standard'
}

export function getSentimentEmailGreeting(arc: SentimentArc, firstName: string): string {
  switch (arc) {
    case 'recovered':
      return `Hi ${firstName}, thank you for your patience today. We completely understand how frustrating this experience must have been — you deserved a faster, smoother resolution, and we're truly sorry for the difficulty you had in reaching us. We're glad we were able to make things right.`
    case 'improved':
      return `Hi ${firstName}, thank you for bringing this to our attention. We understand this wasn't the experience you expected, and we're sorry for the inconvenience. We hope the steps we took today have helped move things in the right direction.`
    case 'frustrated':
      return `Hi ${firstName}, we sincerely apologise for the experience you had today. We hear your frustration clearly and take full responsibility. We are committed to making this right.`
    case 'delighted':
      return `Hi ${firstName}, it was such a pleasure speaking with you today! We're delighted everything went smoothly and that we could assist you.`
    case 'positive':
      return `Hi ${firstName}, thank you for reaching out today. We're happy we could resolve things for you and leave you in a good place.`
    default:
      return `Hi ${firstName}, thank you for your call today — here's a recap of what we covered.`
  }
}

export function getSentimentEmailClosing(arc: SentimentArc): string {
  switch (arc) {
    case 'recovered':
      return `We know experiences like this can shake your confidence in us, and that matters to us deeply. We're actively working to make sure this doesn't happen again — your feedback is a real driver of that improvement.`
    case 'improved':
      return `We're committed to improving our processes so you don't face situations like this again. Thank you for your understanding and for giving us the opportunity to help.`
    case 'frustrated':
      return `We understand we did not meet your expectations today, and we are truly sorry. Your experience has been noted and we are committed to doing better for you and every customer.`
    case 'delighted':
      return `Thank you for being such a pleasure to work with. It's customers like you that make our work rewarding!`
    case 'positive':
      return `We're always here if you need anything. Have a wonderful rest of your day!`
    default:
      return `Don't hesitate to reach out if there's anything else we can help with.`
  }
}

/** One short sentence for SMS / WhatsApp where space is tight. */
export function getSentimentBrief(arc: SentimentArc): string {
  switch (arc) {
    case 'recovered':  return `We're sorry for the frustration — glad we could make it right.`
    case 'improved':   return `Sorry for the inconvenience — we hope this helps.`
    case 'frustrated': return `We sincerely apologise for this experience.`
    case 'delighted':  return `It was a pleasure helping you today!`
    case 'positive':   return `Happy we could help!`
    default:           return ``
  }
}
