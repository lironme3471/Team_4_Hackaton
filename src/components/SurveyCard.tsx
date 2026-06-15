import { useEffect, useState } from 'react'
import type { Survey } from '../lib/survey'
import { submitFeedback } from '../lib/feedback'

export interface SurveyContext {
  interactionId: string
  customer: string
  channel: string
}

/**
 * Interactive feedback survey. Captures the response in local state, sends it
 * to the placeholder feedback receiver, and confirms — no navigation to an
 * external page (this is a self-contained prototype).
 */
export function SurveyCard({ survey, context }: { survey: Survey; context?: SurveyContext }) {
  const [rating, setRating] = useState(0)
  const [resolved, setResolved] = useState<'yes' | 'no' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (context) {
      submitFeedback({
        interactionId: context.interactionId,
        customer: context.customer,
        channel: context.channel,
        rating,
        resolved,
        submittedAt: new Date().toISOString(),
      })
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
        <p className="text-sm font-semibold text-emerald-700">✓ Thanks for your feedback!</p>
        <p className="text-[11px] text-ink-500">
          You rated us {rating}/5{resolved ? ` · resolved: ${resolved === 'yes' ? 'yes' : 'not yet'}` : ''}. This helps us close the loop.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700">
        Quick feedback · {survey.duration}
      </h2>
      <p className="text-[13px]">{survey.question}</p>
      <div className="mt-1.5 flex gap-1 text-xl leading-none">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={n <= rating}
            className="text-amber-400 transition hover:scale-110 hover:text-amber-500"
          >
            {n <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
      <p className="mt-2 flex items-center gap-2 text-[13px]">
        {survey.resolved}
        <button
          type="button"
          onClick={() => setResolved('yes')}
          aria-pressed={resolved === 'yes'}
          className={`rounded border px-2 py-0.5 font-medium transition ${
            resolved === 'yes' ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : 'border-ink-200 text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          👍 Yes
        </button>
        <button
          type="button"
          onClick={() => setResolved('no')}
          aria-pressed={resolved === 'no'}
          className={`rounded border px-2 py-0.5 font-medium transition ${
            resolved === 'no' ? 'border-rose-500 bg-rose-100 text-rose-700' : 'border-ink-200 text-rose-600 hover:bg-rose-50'
          }`}
        >
          👎 Not yet
        </button>
      </p>
      <button
        type="button"
        disabled={rating === 0}
        onClick={handleSubmit}
        className="mt-2 inline-block rounded bg-[#1a73e8] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1666d0] disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400"
      >
        Submit feedback
      </button>
    </div>
  )
}

/**
 * Overlay wrapper used when a survey link inside a message (SMS/WhatsApp) is
 * clicked — opens the interactive SurveyCard instead of navigating to the URL.
 */
export function SurveyModal({ survey, context, onClose }: { survey: Survey; context?: SurveyContext; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div className="w-[360px] max-w-full" onClick={(e) => e.stopPropagation()}>
        <SurveyCard survey={survey} context={context} />
        <button
          onClick={onClose}
          className="mt-2 w-full rounded bg-white/90 py-1.5 text-xs font-medium text-ink-600 ring-1 ring-black/10 hover:bg-white"
        >
          Close
        </button>
      </div>
    </div>
  )
}
