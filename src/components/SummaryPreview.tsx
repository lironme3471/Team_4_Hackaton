import { useEffect, useState } from 'react'
import type { Channel, Contact, LoopSummary, TranscriptLine } from '../types'
import type { Survey } from '../lib/survey'
import { AGENT } from '../data/mockData'
import { EmailPreview } from './EmailPreview'
import { SurveyModal } from './SurveyCard'
import { WhatsAppIcon } from './icons'
import { getSentimentArc, getSentimentBrief } from '../utils/sentimentCopy'

const BRAND = 'CX Loop'

function firstName(contact: Contact) {
  return contact.name.split(' ')[0]
}

function audioUrl(interactionId: string) {
  return `${import.meta.env.BASE_URL}audio/call-${interactionId}.mp3`
}

function transcriptText(lines: TranscriptLine[]): string {
  return lines.map((l) => `${l.speaker === 'agent' ? 'Agent' : 'Caller'}: ${l.text}`).join('\n')
}

function downloadTranscriptFile(lines: TranscriptLine[], interactionId: string) {
  const blob = new Blob([transcriptText(lines)], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `call-transcript-${interactionId}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Builds the short, plain-text body used for SMS — one segment where possible,
 * with a link to the richer email recap rather than the full content.
 */
function buildSmsText(
  contact: Contact,
  summary: LoopSummary,
  tips: string[],
  sentimentLines: TranscriptLine[] | undefined,
  transcript: TranscriptLine[] | undefined,
  includeRecording: boolean | undefined,
  interactionId: string,
  survey?: Survey,
) {
  const arc = getSentimentArc(sentimentLines ?? [])
  const brief = getSentimentBrief(arc)
  const resolved = summary.resolved[0] ?? 'your request'
  const next = summary.nextSteps[0]
  let msg = `${BRAND}: Hi ${firstName(contact)}, thanks for contacting us.`
  if (brief) msg += ` ${brief}`
  msg += ` Resolved: ${resolved}.`
  if (next) msg += ` Next: ${next}.`
  if (tips[0]) msg += ` Tip: ${tips[0]}`
  if (transcript) msg += ` 📄 Transcript: cxloop.com/files/transcript-${interactionId}.txt`
  if (includeRecording) msg += ` 🎙 Recording: cxloop.com/files/call-${interactionId}.mp3`
  if (survey) msg += ` Rate us (${survey.duration}): ${survey.url}`
  msg += ` Reply STOP to opt out.`
  return msg
}

const SMS_SEGMENT = 160

/**
 * Renders the right customer-facing template for the chosen send channel.
 * Email keeps the existing Outlook view; SMS and WhatsApp get native-looking
 * messaging templates with channel-appropriate (shorter) content.
 */
export function SummaryPreview({
  channel,
  contact,
  summary,
  tips = [],
  survey,
  interactionId,
  sentimentLines,
  transcript,
  includeRecording,
  onClose,
}: {
  channel: Channel
  contact: Contact
  summary: LoopSummary
  tips?: string[]
  survey?: Survey
  interactionId: string
  sentimentLines?: TranscriptLine[]
  transcript?: TranscriptLine[]
  includeRecording?: boolean
  onClose: () => void
}) {
  if (channel === 'email') {
    return (
      <EmailPreview
        contact={contact}
        summary={summary}
        tips={tips}
        survey={survey}
        interactionId={interactionId}
        transcript={transcript}
        includeRecording={includeRecording}
        onClose={onClose}
      />
    )
  }
  if (channel === 'whatsapp') {
    return (
      <WhatsAppPreview
        contact={contact}
        summary={summary}
        tips={tips}
        survey={survey}
        interactionId={interactionId}
        sentimentLines={sentimentLines}
        transcript={transcript}
        includeRecording={includeRecording}
        onClose={onClose}
      />
    )
  }
  return (
    <SmsPreview
      contact={contact}
      summary={summary}
      tips={tips}
      survey={survey}
      interactionId={interactionId}
      sentimentLines={sentimentLines}
      transcript={transcript}
      includeRecording={includeRecording}
      onClose={onClose}
    />
  )
}

/** Shared modal shell: dim backdrop, Esc / backdrop-click to close. */
function PreviewShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function CloseBar({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex justify-end border-t border-ink-200 bg-[#faf9f8] px-4 py-3">
      <button
        onClick={onClose}
        className="rounded bg-ink-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-ink-900"
      >
        Close
      </button>
    </div>
  )
}

/* ---------------- SMS ---------------- */

function SmsPreview({
  contact, summary, tips, survey, interactionId, sentimentLines, transcript, includeRecording, onClose,
}: {
  contact: Contact; summary: LoopSummary; tips: string[]; survey?: Survey
  interactionId: string; sentimentLines?: TranscriptLine[]; transcript?: TranscriptLine[]; includeRecording?: boolean; onClose: () => void
}) {
  const [surveyOpen, setSurveyOpen] = useState(false)
  const text = buildSmsText(contact, summary, tips, sentimentLines, transcript, includeRecording, interactionId, survey)
  const segments = Math.ceil(text.length / SMS_SEGMENT)
  const [before, after] = survey ? text.split(survey.url) : [text, '']
  const hasAttachments = transcript || includeRecording

  return (
    <PreviewShell onClose={onClose}>
      <div className="flex w-[360px] max-w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-panel ring-1 ring-black/10">
        {/* Phone status / thread header */}
        <div className="flex flex-col items-center gap-1 border-b border-ink-200 bg-[#f6f6f6] px-4 pb-3 pt-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-300 text-sm font-semibold text-white">
            {firstName(contact).charAt(0)}
          </span>
          <span className="text-sm font-semibold text-ink-900">{BRAND} Support</span>
          <span className="text-[11px] text-ink-400">Text Message · SMS</span>
        </div>

        {/* Message thread */}
        <div className="space-y-2 bg-white px-4 py-5">
          <div className="text-center text-[10px] text-ink-400">Today</div>
          <div className="flex justify-end">
            <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-[#0b93f6] px-3.5 py-2 text-[13px] leading-relaxed text-white">
              {before}
              {survey && (
                <>
                  <button
                    type="button"
                    onClick={() => setSurveyOpen(true)}
                    className="break-all font-medium text-white underline underline-offset-2"
                  >
                    {survey.url}
                  </button>
                  {after}
                </>
              )}
            </div>
          </div>
          <div className="text-right text-[10px] text-ink-400">Delivered</div>

          {/* Inline download links rendered below the bubble for the prototype */}
          {hasAttachments && (
            <div className="flex flex-col gap-1.5 pt-1">
              {transcript && (
                <button
                  onClick={() => downloadTranscriptFile(transcript, interactionId)}
                  className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-left text-xs text-ink-700 hover:bg-ink-100"
                >
                  <span className="text-base">📄</span>
                  <div>
                    <div className="font-medium">call-transcript-{interactionId}.txt</div>
                    <div className="text-[10px] text-ink-400">Tap to download</div>
                  </div>
                </button>
              )}
              {includeRecording && (
                <div className="rounded-xl border border-ink-200 bg-ink-50 px-3 py-2">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-base">🎙</span>
                    <div>
                      <a
                        href={audioUrl(interactionId)}
                        download={`call-recording-${interactionId}.mp3`}
                        className="text-xs font-medium text-[#0b93f6] hover:underline"
                      >
                        call-recording-{interactionId}.mp3
                      </a>
                      <div className="text-[10px] text-ink-400">Tap to download</div>
                    </div>
                  </div>
                  <audio controls src={audioUrl(interactionId)} className="h-8 w-full" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compose bar (decorative) + meta */}
        <div className="border-t border-ink-100 px-4 py-2 text-center text-[10px] text-ink-400">
          {text.length} characters · {segments} SMS segment{segments > 1 ? 's' : ''}
        </div>
        <CloseBar onClose={onClose} />
      </div>
      {surveyOpen && survey && (
        <SurveyModal
          survey={survey}
          context={{ interactionId, customer: contact.name, channel: 'sms' }}
          onClose={() => setSurveyOpen(false)}
        />
      )}
    </PreviewShell>
  )
}

/* ---------------- WhatsApp ---------------- */

function WhatsAppPreview({
  contact, summary, tips, survey, interactionId, sentimentLines, transcript, includeRecording, onClose,
}: {
  contact: Contact; summary: LoopSummary; tips: string[]; survey?: Survey
  interactionId: string; sentimentLines?: TranscriptLine[]; transcript?: TranscriptLine[]; includeRecording?: boolean; onClose: () => void
}) {
  const [surveyOpen, setSurveyOpen] = useState(false)
  const hasAttachments = transcript || includeRecording
  const arc = getSentimentArc(sentimentLines ?? [])
  const brief = getSentimentBrief(arc)

  return (
    <PreviewShell onClose={onClose}>
      <div className="flex w-[380px] max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-panel ring-1 ring-black/10">
        {/* WhatsApp header */}
        <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{BRAND} Support</div>
            <div className="text-[11px] text-white/70">business account · online</div>
          </div>
        </div>

        {/* Chat area */}
        <div
          className="scrollbar-thin max-h-[70vh] space-y-2 overflow-y-auto px-4 py-4"
          style={{ backgroundColor: '#ece5dd' }}
        >
          <div className="ml-auto max-w-[88%]">
            <div className="rounded-lg rounded-tr-sm bg-[#dcf8c6] px-3 py-2 text-[13px] leading-relaxed text-ink-900 shadow-sm">
              <p className="font-semibold">{BRAND} — your call recap ✅</p>
              <p className="mt-1.5">Hi {firstName(contact)} 👋</p>
              {brief && <p className="mt-1 text-ink-700 italic">{brief}</p>}

              <p className="mt-2 font-semibold">What we resolved</p>
              {summary.resolved.map((r, i) => (
                <p key={i}>✓ {r}</p>
              ))}

              <p className="mt-2 font-semibold">What happens next</p>
              {summary.nextSteps.map((s, i) => (
                <p key={i}>➡️ {s}</p>
              ))}

              {tips.length > 0 && (
                <>
                  <p className="mt-2 font-semibold">💡 A couple of tips</p>
                  {tips.map((t, i) => (
                    <p key={i} className="mt-0.5">• {t}</p>
                  ))}
                </>
              )}

              {survey && (
                <>
                  <p className="mt-2 font-semibold">📝 {survey.question}</p>
                  <p className="mt-0.5">
                    Rate us ({survey.duration}):{' '}
                    <button
                      type="button"
                      onClick={() => setSurveyOpen(true)}
                      className="break-all text-[#1a73e8] underline underline-offset-2"
                    >
                      {survey.url}
                    </button>
                  </p>
                </>
              )}

              <p className="mt-2">Questions? Just reply here 💬</p>
              <p className="mt-1 text-ink-600">— {AGENT.name}, {BRAND} Support</p>

              <div className="mt-1 text-right text-[10px] text-ink-400">
                {whatsAppTime()} ✓✓
              </div>
            </div>

            {/* Attachment cards — rendered as separate WhatsApp file/audio bubbles */}
            {hasAttachments && (
              <div className="mt-2 space-y-1.5">
                {transcript && (
                  <button
                    onClick={() => downloadTranscriptFile(transcript, interactionId)}
                    className="flex w-full items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 text-left shadow-sm hover:bg-ink-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25d366]/10 text-xl">
                      📄
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-ink-900">
                        call-transcript-{interactionId}.txt
                      </div>
                      <div className="text-[11px] text-ink-400">Tap to download · TXT</div>
                    </div>
                  </button>
                )}
                {includeRecording && (
                  <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25d366]/10 text-xl">
                        🎙
                      </span>
                      <div className="min-w-0 flex-1">
                        <a
                          href={audioUrl(interactionId)}
                          download={`call-recording-${interactionId}.mp3`}
                          className="block truncate text-[13px] font-medium text-[#075e54] hover:underline"
                        >
                          call-recording-{interactionId}.mp3
                        </a>
                        <div className="text-[11px] text-ink-400">Tap to download · MP3</div>
                      </div>
                    </div>
                    <audio controls src={audioUrl(interactionId)} className="h-8 w-full" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <CloseBar onClose={onClose} />
      </div>
      {surveyOpen && survey && (
        <SurveyModal
          survey={survey}
          context={{ interactionId, customer: contact.name, channel: 'whatsapp' }}
          onClose={() => setSurveyOpen(false)}
        />
      )}
    </PreviewShell>
  )
}

function whatsAppTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
