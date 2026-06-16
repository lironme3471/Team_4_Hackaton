import { useState } from 'react'
import { downloadCalendarFile, generateOutlookWebLink } from '../utils/calendarService'
import { parseMMDDDate, formatDateReadable } from '../utils/dateUtils'

interface CalendarWidgetProps {
  followUpText: string
  dueDate: string // MM/DD format
  interactionId: string
}

export function CalendarWidget({
  followUpText,
  dueDate,
  interactionId,
}: CalendarWidgetProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fullDate = parseMMDDDate(dueDate)
  if (!fullDate) {
    // Invalid date format, don't render widget
    return <span>{dueDate}</span>
  }

  const readableDate = formatDateReadable(fullDate)

  const handleDownloadCalendar = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      downloadCalendarFile(followUpText, fullDate, interactionId)
      setError(null)
    } catch (err) {
      setError('Failed to download calendar file')
      console.error(err)
    }
  }

  const handleOutlookWeb = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const link = generateOutlookWebLink(followUpText, fullDate)
      window.open(link, '_blank', 'noopener,noreferrer')
      setError(null)
    } catch (err) {
      setError('Failed to open Outlook')
      console.error(err)
    }
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Date text that triggers hover */}
      <span className="cursor-help border-b border-dashed border-ink-300 text-ink-400 hover:text-ink-600">
        {dueDate}
      </span>

      {/* Tooltip widget - appears on hover */}
      {isHovering && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink-200 bg-white px-3 py-2 shadow-lg ring-1 ring-black/10">
          {/* Triangle pointer */}
          <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-full rotate-45 border-r border-b border-ink-200 bg-white" />

          {/* Tooltip content */}
          <div className="text-xs">
            <div className="font-semibold text-ink-900">
              {followUpText.length > 40
                ? followUpText.substring(0, 40) + '...'
                : followUpText}
            </div>
            <div className="mt-1 text-ink-500">{readableDate}</div>

            {/* Action buttons */}
            <div className="mt-2 flex flex-col gap-1.5">
              <button
                onClick={handleDownloadCalendar}
                className="inline-flex items-center gap-1.5 rounded bg-[#0f6cbd] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#005a9e]"
              >
                <span>📅</span>
                <span>Add to Outlook</span>
              </button>

              <button
                onClick={handleOutlookWeb}
                className="inline-flex items-center gap-1.5 rounded border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-100"
              >
                <span>🌐</span>
                <span>Open in Outlook Web</span>
              </button>

              {error && (
                <div className="text-red-600">{error}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
