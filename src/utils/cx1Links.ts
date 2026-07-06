export type Cx1Resource = 'transcript' | 'recording'

const DEFAULT_CX1_BASE_URL = 'https://cx1.example.com'

function normalizeBaseUrl(rawBaseUrl: string | undefined): string {
  const base = rawBaseUrl?.trim() || DEFAULT_CX1_BASE_URL
  return base.endsWith('/') ? base.slice(0, -1) : base
}

function interactionBaseUrl(interactionId: string): string {
  const encodedId = encodeURIComponent(interactionId)
  const base = normalizeBaseUrl(import.meta.env.VITE_CX1_BASE_URL)
  return `${base}/interactions/${encodedId}`
}

export function getCx1ResourceUrl(interactionId: string, resource: Cx1Resource): string {
  return `${interactionBaseUrl(interactionId)}/${resource}`
}

export function getCx1TranscriptUrl(interactionId: string): string {
  return getCx1ResourceUrl(interactionId, 'transcript')
}

export function getCx1RecordingUrl(interactionId: string): string {
  return getCx1ResourceUrl(interactionId, 'recording')
}
