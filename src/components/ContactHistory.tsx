import type { CallHistoryEntry } from '../types'
import { HistoryIcon, InboundCallIcon, OutboundCallIcon } from './icons'

export function ContactHistory({
  entries,
  onRedial,
}: {
  entries: CallHistoryEntry[]
  onRedial: () => void
}) {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-ink-100/40">
      <div className="flex items-center gap-2 border-b border-ink-200 bg-white px-5 py-3">
        <HistoryIcon className="h-5 w-5 text-ink-500" />
        <h1 className="text-sm font-semibold text-ink-900">Contact History</h1>
      </div>

      <div className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto p-5">
        {entries.map((e) => {
          const Dir = e.direction === 'outbound' ? OutboundCallIcon : InboundCallIcon
          return (
            <button
              key={e.id}
              onClick={onRedial}
              title="Start a new call"
              className="flex w-full items-center justify-between rounded-lg border border-ink-200 bg-white px-4 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900">{e.phone}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                  <Dir className="h-4 w-4 text-violet-600" />
                  {e.skill}
                </div>
              </div>
              <div className="border-l border-ink-200 pl-4 text-right">
                <div className="text-xs tabular-nums text-ink-700">{e.dateTime}</div>
                <div className="mt-0.5 text-xs text-ink-400">{e.status}</div>
              </div>
            </button>
          )
        })}
      </div>
    </main>
  )
}
