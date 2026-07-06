import { useEffect } from 'react'
import type { Contact, LoopSummary, TranscriptLine } from '../types'
import type { Survey } from '../lib/survey'
import { AGENT } from '../data/mockData'
import { CalendarWidget } from './CalendarWidget'
import { SurveyCard } from './SurveyCard'
import { getCx1RecordingUrl, getCx1TranscriptUrl } from '../utils/cx1Links'

const BRAND = 'CX Loop'
const FROM_EMAIL = 'support@cxloop.com'
const inlineDatePattern = /\b((?:0?[1-9]|1[0-2])\/(?:0?[1-9]|[12]\d|3[01])|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2})\b/

function fmtMailDate() {
  return new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function renderCalendarDate(text: string, eventTitle: string, interactionId: string) {
  const match = text.match(inlineDatePattern)

  if (!match || match.index === undefined) {
    return text
  }

  const dateLabel = match[0]
  const before = text.slice(0, match.index)
  const after = text.slice(match.index + dateLabel.length)

  return (
    <>
      {before}
      <CalendarWidget
        followUpText={eventTitle}
        dueDate={dateLabel}
        interactionId={interactionId}
        className="cursor-help border-b border-dashed border-current text-current hover:text-[#0f6cbd]"
      />
      {after}
    </>
  )
}

/** Tiny inline icons for the Outlook command bar (decorative). */
const cmd = 'h-4 w-4'
const ReplyI = () => (
  <svg className={cmd} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 1 5 5v1" /></svg>
)
const ReplyAllI = () => (
  <svg className={cmd} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M7 7 2 12l5 5M11 7 6 12l5 5M6 12h9a5 5 0 0 1 5 5v1" /></svg>
)
const ForwardI = () => (
  <svg className={cmd} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="m15 7 5 5-5 5M20 12H9a5 5 0 0 0-5 5v1" /></svg>
)
const TrashI = () => (
  <svg className={cmd} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
)

/**
 * Outlook-365-styled preview of the loop summary as the customer receives it.
 * Transcript and recording are shared as CX1 view links.
 */
export function EmailPreview({
  contact,
  summary,
  tips = [],
  survey,
  interactionId,
  transcript,
  includeRecording,
  onClose,
}: {
  contact: Contact
  summary: LoopSummary
  tips?: string[]
  survey?: Survey
  interactionId: string
  transcript?: TranscriptLine[]
  includeRecording?: boolean
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const firstName = contact.name.split(' ')[0]
  const subject = `${firstName}, here's a recap of your call with ${BRAND}`
  const hasAttachments = transcript || includeRecording
  const transcriptLink = getCx1TranscriptUrl(interactionId)
  const recordingLink = getCx1RecordingUrl(interactionId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-panel ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlook title bar */}
        <div className="flex items-center gap-2 bg-[#0f6cbd] px-4 py-2 text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-white/15">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <span className="text-sm font-semibold">Outlook</span>
          <span className="text-xs text-white/70">— Message (HTML)</span>
        </div>

        {/* Command bar */}
        <div className="flex items-center gap-4 border-b border-ink-200 bg-[#faf9f8] px-4 py-1.5 text-[11px] text-ink-600">
          <span className="flex items-center gap-1"><ReplyI /> Reply</span>
          <span className="flex items-center gap-1"><ReplyAllI /> Reply all</span>
          <span className="flex items-center gap-1"><ForwardI /> Forward</span>
          <span className="ml-auto flex items-center gap-1"><TrashI /> Delete</span>
        </div>

        {/* Message header */}
        <div className="border-b border-ink-200 px-5 py-3">
          <h1 className="text-lg font-semibold text-ink-900">{subject}</h1>
          <div className="mt-2 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f6cbd] text-sm font-semibold text-white">
              CX
            </span>
            <div className="min-w-0 flex-1 text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-ink-900">
                  {BRAND} Support <span className="font-normal text-ink-400">&lt;{FROM_EMAIL}&gt;</span>
                </span>
                <span className="shrink-0 text-ink-400">{fmtMailDate()}</span>
              </div>
              <div className="mt-0.5 text-ink-500">
                To: {contact.name} &lt;{contact.email}&gt;
              </div>
            </div>
          </div>

          {/* Attachments row */}
          {hasAttachments && (
            <div className="mt-2 flex flex-wrap gap-2 border-t border-ink-100 pt-2">
              {transcript && (
                <a
                  href={transcriptLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded border border-ink-200 bg-ink-50 px-2.5 py-1 text-xs text-ink-700 hover:bg-ink-100"
                >
                  <span>📄</span> View transcript in CX1
                </a>
              )}
              {includeRecording && (
                <a
                  href={recordingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded border border-ink-200 bg-ink-50 px-2.5 py-1 text-xs text-ink-700 hover:bg-ink-100"
                >
                  <span>🎙</span> View recording in CX1
                </a>
              )}
            </div>
          )}
        </div>

        {/* Email body */}
        <div className="scrollbar-thin flex-1 overflow-y-auto bg-ink-100/40 p-5">
          <div className="mx-auto max-w-xl overflow-hidden rounded-lg bg-white shadow-card">
            {/* Brand header band */}
            <div className="bg-[#1a73e8] px-6 py-4 text-white">
              <div className="text-lg font-bold tracking-tight">
                CX<span className="font-normal">Loop</span>
              </div>
              <div className="text-[11px] text-white/80">Closing the loop on your support call</div>
            </div>

            <div className="space-y-4 px-6 py-5 text-sm text-ink-800">
              <p>{summary.greeting}</p>

              <div>
                <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-600">What we resolved</h2>
                <ul className="space-y-1">
                  {summary.resolved.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#1a73e8]">What happens next</h2>
                <ul className="space-y-1">
                  {summary.nextSteps.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#1a73e8]">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {tips.length > 0 && (
                <div className="rounded-lg border border-[#1a73e8]/20 bg-[#1a73e8]/5 p-3">
                  <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#1a73e8]">Looking ahead — a few tips</h2>
                  <ul className="space-y-1.5">
                    {tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-[13px]">
                        <span>💡</span>
                        <span>{renderCalendarDate(t, t, interactionId)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="italic text-ink-500">{summary.closing}</p>

              {/* Conversation-tailored feedback survey */}
              {survey && (
                <SurveyCard
                  survey={survey}
                  context={{ interactionId, customer: contact.name, channel: 'email' }}
                />
              )}

              {/* Attachments section in email body */}
              {hasAttachments && (
                <div className="rounded-lg border border-ink-200 bg-ink-50 p-3">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-500">Attachments</h2>
                  <ul className="space-y-2">
                    {transcript && (
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 text-base leading-none">📄</span>
                        <div>
                          <a
                            href={transcriptLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-[#1a73e8] hover:underline"
                          >
                            View transcript in CX1
                          </a>
                          <p className="text-[11px] text-ink-400">Open the full call transcript in CX1</p>
                        </div>
                      </li>
                    )}
                    {includeRecording && (
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 text-base leading-none">🎙</span>
                        <div>
                          <a
                            href={recordingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-[#1a73e8] hover:underline"
                          >
                            View recording in CX1
                          </a>
                          <p className="mt-1 text-[11px] text-ink-400">Open the call recording in CX1</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="border-t border-ink-100 pt-3 text-xs text-ink-500">
                Warm regards,
                <br />
                <span className="font-medium text-ink-700">{AGENT.name}</span> · {BRAND} Support
              </div>
            </div>

            <div className="border-t border-ink-100 px-6 py-3 text-[10px] leading-relaxed text-ink-400">
              You're receiving this because you recently contacted {BRAND} Support. Replies go to a
              monitored support inbox. © {new Date().getFullYear()} {BRAND}, Inc.
            </div>
          </div>
        </div>

        {/* Single close action */}
        <div className="flex justify-end border-t border-ink-200 bg-[#faf9f8] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded bg-[#0f6cbd] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#0e5da3]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
