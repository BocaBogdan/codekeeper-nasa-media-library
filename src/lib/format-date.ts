/**
 * Formats an ISO date string as a long date, e.g. "June 3, 1969".
 *
 * NASA dates are midnight UTC, so the date is formatted in UTC to avoid
 * showing the previous day in time zones west of Greenwich.
 * Returns the input unchanged when it cannot be parsed.
 */
export function formatDate(isoDate: string, locale = 'en-US'): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
