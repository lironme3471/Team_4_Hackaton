import { useState } from 'react'
import type { CallHistoryEntry, LoopRecord } from '../types'
import { LiveTranscript } from './LiveTranscript'
import { CloseIcon } from './icons'

export function CallPlaybackView({
  loopId,
  entries,
  onClose,
}: {
  loopId: string
  entries: CallHistoryEntry[]
  onClose: () => void
}) {
  const [restartKey, setRestartKey] = useState(0)

  // Find the loop record from the entries
  const entry = entries.find((e) => e.id === loopId)
  const record = entry?.loopRecord as LoopRecord | undefined

  if (!record) {
    return (
      <main className="flex min-w-0 flex-1 flex-col bg-ink-100/40">
        <div className="flex items-center justify-between border-b border-ink-200 bg-white px-5 py-3">
          <h1 className="text-sm font-semibold text-ink-900">Call Playback</h1>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="text-center">
            <p className="text-sm text-ink-600">Call recording not found</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-ink-100/40">
      <div className="flex items-center justify-between border-b border-ink-200 bg-white px-5 py-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-ink-900">Call Playback</h1>
          <p className="mt-1 text-xs text-ink-500">
            {record.contact.name} • {record.interaction.subject}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl space-y-4">
          {/* Customer Card */}
          <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div
                className="h-12 w-12 rounded-full"
                style={{ backgroundColor: record.contact.avatarColor }}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-ink-900">{record.contact.name}</h2>
                <p className="text-xs text-ink-500">{record.contact.company}</p>
                <p className="mt-1 text-xs text-ink-600">{record.contact.email}</p>
                <p className="text-xs text-ink-500 mt-0.5">{record.contact.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-ink-600">Tier: {record.contact.tier}</p>
                <p className="text-xs text-ink-500 mt-1">Since {record.contact.since}</p>
              </div>
            </div>
          </div>

          {/* Call Info */}
          <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Duration:</span>
                <span className="font-medium text-ink-900">
                  {Math.floor(record.interaction.durationSec / 60)}m{record.interaction.durationSec % 60}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Skill:</span>
                <span className="font-medium text-ink-900">{record.interaction.skill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Sentiment:</span>
                <span className={`font-medium ${
                  record.interaction.sentiment === 'positive' ? 'text-emerald-600' :
                  record.interaction.sentiment === 'negative' ? 'text-rose-600' :
                  'text-amber-600'
                }`}>
                  {record.interaction.sentiment}
                </span>
              </div>
            </div>
          </div>

          {/* Transcript with Voice Playback */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Call Transcript</h3>
              <button
                onClick={() => setRestartKey((k) => k + 1)}
                title="Restart playback"
                className="rounded-md px-2.5 py-1 text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition"
              >
                Restart
              </button>
            </div>
            <LiveTranscript
              lines={record.liveTranscript}
              restartKey={`playback-${loopId}-${restartKey}`}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
