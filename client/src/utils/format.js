/**
 * Client-side salon-local (Asia/Kolkata) date/time helpers.
 * All appointment dates are stored as Asia/Kolkata instants on the server, so
 * the browser renders them in the salon's timezone rather than the visitor's.
 */
export const SALON_TIMEZONE = 'Asia/Kolkata';
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Human date, e.g. "20 Aug 2026" in Asia/Kolkata. */
export function formatDateIST(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: SALON_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** Clock time, e.g. "14:30" in Asia/Kolkata. */
export function formatTimeIST(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SALON_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/** Today's calendar date (YYYY-MM-DD) in Asia/Kolkata. */
export function todayISTString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * End time for a `YYYY-MM-DD` (interpreted in Asia/Kolkata) + `HH:MM` + duration.
 * Returns an ISO string of the absolute instant, or null if inputs are invalid.
 */
export function endTimeISO(dateStr, timeStr, durationMinutes) {
  if (!TIME_RE.test(timeStr || '')) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(`${dateStr}T00:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(h, m, 0, 0);
  d.setTime(d.getTime() + Number(durationMinutes || 0) * 60000);
  return d.toISOString();
}