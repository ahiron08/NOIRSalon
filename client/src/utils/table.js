/**
 * Client-side table helpers used by the admin list pages for
 * searching, filtering and sorting in-memory rows.
 */

/** Return the value at a dot-path (e.g. 'user.name') on an object, or undefined. */
export function getPath(obj, path) {
  if (obj == null) return undefined;
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

/**
 * Compare two values across types — numbers numerically, everything else
 * case-insensitively as text. Null/undefined sort last when ascending.
 */
export function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  const aNum = typeof a === 'number' ? a : Number(a);
  const bNum = typeof b === 'number' ? b : Number(b);
  // Only treat as numeric when BOTH are already numbers or both coerce cleanly.
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  return sa.localeCompare(sb, undefined, { numeric: true });
}
