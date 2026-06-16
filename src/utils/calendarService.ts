/**
 * Generate an iCalendar (.ics) file content for a follow-up task.
 * This format can be imported into Outlook, Google Calendar, Apple Calendar, etc.
 */
export function generateICS(
  followUpText: string,
  dueDate: Date,
  interactionId: string
): string {
  // Format date and time in iCalendar format (UTC)
  const year = dueDate.getFullYear()
  const month = String(dueDate.getMonth() + 1).padStart(2, '0')
  const day = String(dueDate.getDate()).padStart(2, '0')

  // Set time to 9 AM UTC on the due date
  const startTime = `${year}${month}${day}T090000Z`
  const endTime = `${year}${month}${day}T100000Z`

  // Create unique identifier
  const uid = `followup-${interactionId}-${Date.now()}@cxloop.com`

  // Escape special characters in text
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n')
  }

  const escapedText = escapeText(followUpText)

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CX Loop//Follow-up Tasks//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:Follow-up: ${escapedText}
DESCRIPTION:CX Loop follow-up task from a recent support call
STATUS:NEEDS-ACTION
PRIORITY:5
END:VEVENT
END:VCALENDAR`

  return ics
}

/**
 * Download an .ics file to the user's device.
 * This triggers a browser download, and the user can then open it with Outlook or another calendar app.
 */
export function downloadCalendarFile(
  followUpText: string,
  dueDate: Date,
  interactionId: string
): void {
  const ics = generateICS(followUpText, dueDate, interactionId)
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `followup-${dueDate.toISOString().split('T')[0]}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Generate an Outlook web deep link to add an event.
 * This opens Outlook online with pre-filled event details.
 * Note: Only works if user has outlook.com or office365 account configured in browser.
 */
export function generateOutlookWebLink(
  followUpText: string,
  dueDate: Date
): string {
  const startTime = dueDate.toISOString()
  // End time is 1 hour later
  const endTime = new Date(dueDate.getTime() + 3600000).toISOString()

  const params = new URLSearchParams({
    rru: 'addevent',
    startdt: startTime,
    enddt: endTime,
    subject: `Follow-up: ${followUpText}`,
    body: 'CX Loop follow-up task from a recent support call',
    location: '',
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}
