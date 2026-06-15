import type { CallHistoryEntry } from '../types'
import { HistoryIcon, InboundCallIcon, OutboundCallIcon } from './icons'

export function ContactHistory({
  entries,
  onRedial,
  onPlayCall,
}: {
  entries: CallHistoryEntry[]
  onRedial: () => void
  onPlayCall?: (id: string) => void
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
            <div
              key={e.id}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink-200 bg-white px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <button
                onClick={onRedial}
                title="Start a new call"
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-sm font-semibold text-ink-900">
                  {e.loopRecord?.contact.name || e.phone}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                  <Dir className="h-4 w-4 text-violet-600" />
                  {e.phone}
                </div>
                <div className="mt-0.5 text-xs text-ink-500">{e.skill}</div>
              </button>
              <div className="border-l border-ink-200 pl-4 text-right">
                <div className="text-xs tabular-nums text-ink-700">{e.dateTime}</div>
                <div className="mt-0.5 text-xs text-ink-400">{e.status}</div>
              </div>
              {e.loopRecord && onPlayCall && (
                <button
                  onClick={() => onPlayCall(e.id)}
                  title="Play call recording"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-brand-50 hover:text-brand-600 transition"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.596 8.697l-6.363-3.692c-.54-.313-1.233.066-1.233.697v7.39c0 .63.692 1.01 1.233.697l6.363-3.692a.802.802 0 000-1.393z" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
