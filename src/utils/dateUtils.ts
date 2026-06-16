/**
 * Parse a date string in MM/DD format and return a full Date object.
 * Automatically infers the year based on whether the date has passed in the current year.
 *
 * @param dateStr - Date string in MM/DD format (e.g., "06/15")
 * @returns Date object or null if parsing fails
 */
export function parseMMDDDate(dateStr: string): Date | null {
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null

  const month = parseInt(match[1], 10)
  const day = parseInt(match[2], 10)

  // Validate month and day
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  const today = new Date()
  const currentYear = today.getFullYear()

  // Try current year first
  let date = new Date(currentYear, month - 1, day)

  // If the date has already passed, assume it's for next year
  if (date < today) {
    date = new Date(currentYear + 1, month - 1, day)
  }

  return date
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
