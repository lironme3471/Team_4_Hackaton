const monthNames = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

function inferYear(month: number, day: number): Date {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentYearDate = new Date(currentYear, month - 1, day)

  if (currentYearDate < today) {
    return new Date(currentYear + 1, month - 1, day)
  }

  return currentYearDate
}

/**
 * Parse a date string in either MM/DD or Month Day format and return a full Date object.
 * Automatically infers the year based on whether the date has passed in the current year.
 */
export function parseDateLabel(dateStr: string): Date | null {
  const trimmedDate = dateStr.trim()
  const numericMatch = trimmedDate.match(/^(\d{1,2})\/(\d{1,2})$/)

  if (numericMatch) {
    const month = parseInt(numericMatch[1], 10)
    const day = parseInt(numericMatch[2], 10)

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null
    }

    return inferYear(month, day)
  }

  const longMonthMatch = trimmedDate.match(/^([A-Za-z]+)\s+(\d{1,2})$/)
  if (!longMonthMatch) {
    return null
  }

  const monthIndex = monthNames.indexOf(longMonthMatch[1].toLowerCase())
  const day = parseInt(longMonthMatch[2], 10)

  if (monthIndex === -1 || day < 1 || day > 31) {
    return null
  }

  return inferYear(monthIndex + 1, day)
}

export function parseMMDDDate(dateStr: string): Date | null {
  return parseDateLabel(dateStr)
}

/**
 * Format a Date object back to MM/DD format.
 */
export function formatMMDD(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

/**
 * Format a Date object to a readable string (e.g., "June 15, 2026")
 */
export function formatDateReadable(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
