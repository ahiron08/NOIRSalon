/**
 * Salon-local time helpers.
 *
 * NOIR Salon operates in India, so every appointment calculation is done in
 * the Asia/Kolkata timezone. Dates are stored as absolute `Date` instants where
 * the wall-clock time in Asia/Kolkata is the intended salon-local time; the
 * `date` field on an appointment is normalised to the start of the day in
 * Asia/Kolkata (e.g. 2026-08-20T00:00:00+05:30, stored as UTC 2026-08-19T18:30Z).
 *
 * Never compare raw `YYYY-MM-DD` strings; always round-trip through these
 * helpers so a value never silently shifts by the +05:30 offset.
 */
export const SALON_TIMEZONE = 'Asia/Kolkata';
const OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // +05:30

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Strictly validate a `YYYY-MM-DD` string and return { y, m, d }, or null. */
export function parseDateOnly(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (y < 1 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null; // e.g. 2026-02-30
  }
  return { y, m, d };
}

/** Start-of-day (00:00 Asia/Kolkata) as an absolute Date for a `YYYY-MM-DD`. Returns null if invalid. */
export function dayStartIST(dateStr) {
  const p = parseDateOnly(dateStr);
  if (!p) return null;
  return new Date(Date.UTC(p.y, p.m - 1, p.d) - OFFSET_MS);
}

/** Absolute Date for `YYYY-MM-DD` + `HH:MM` in Asia/Kolkata. Returns null if invalid. */
export function dateTimeIST(dateStr, timeStr) {
  const p = parseDateOnly(dateStr);
  if (!p || typeof timeStr !== 'string' || !TIME_RE.test(timeStr)) return null;
  const [h, min] = timeStr.split(':').map(Number);
  return new Date(Date.UTC(p.y, p.m - 1, p.d, h, min, 0) - OFFSET_MS);
}

/** Calendar date (YYYY-MM-DD) of an instant in Asia/Kolkata. */
export function formatDateIST(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (t) => (parts.find((x) => x.type === t) || {}).value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Clock time (HH:MM) of an instant in Asia/Kolkata. */
export function formatTimeIST(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SALON_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (t) => (parts.find((x) => x.type === t) || {}).value || '00';
  return `${get('hour')}:${get('minute')}`;
}

/** Minutes-of-day (0–1439) of an instant in Asia/Kolkata. */
export function minutesOfDayIST(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SALON_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const h = Number((parts.find((x) => x.type === 'hour') || {}).value || 0);
  const m = Number((parts.find((x) => x.type === 'minute') || {}).value || 0);
  return h * 60 + m;
}

/** Today's calendar date (YYYY-MM-DD) in Asia/Kolkata. */
export function todayISTString() {
  return formatDateIST(new Date());
}

/** Convert an `HH:MM` string to minutes-of-day, or null if malformed. */
export function timeToMinute(timeStr) {
  if (typeof timeStr !== 'string' || !TIME_RE.test(timeStr)) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}
