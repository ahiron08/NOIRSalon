import { useMemo, useState } from 'react';
import { getPath, compareValues } from '../utils/table.js';

/**
 * Client-side search + filter + sort state for in-memory admin tables.
 *
 * @param {Array} items           the full dataset (array of row objects)
 * @param {Object} options
 *   searchFields   dot-path strings or (row) => string getters matched
 *                  case-insensitively against the free-text query
 *   filters        { key: (row) => string|number } getters used for equality
 *                  filters (each key maps to one <select>)
 *   sortAccessors  { key: (row) => number|string|Date } getters used for sorting
 *
 * Returns:
 *   rows           filtered + sorted array (derived from `items`)
 *   query/setQuery free-text search state
 *   filterValues   { key: selectedValue }
 *   setFilter(key, value)
 *   clearAll()     resets query + filters (keeps sort)
 *   sortKey/sortDir/toggleSort(key)
 */
export default function useTableControls(
  items = [],
  { searchFields = [], filters = {}, sortAccessors = {} } = {}
) {
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  const rows = useMemo(() => {
    let out = items;

    const q = query.trim().toLowerCase();
    if (q && searchFields.length) {
      out = out.filter((row) =>
        searchFields.some((field) => {
          const raw = typeof field === 'function' ? field(row) : getPath(row, field);
          return String(raw ?? '').toLowerCase().includes(q);
        })
      );
    }

    Object.entries(filters).forEach(([key, getter]) => {
      const val = filterValues[key];
      if (val != null && val !== '' && val !== 'all') {
        out = out.filter((row) => String(getter(row)) === String(val));
      }
    });

    if (sortKey && sortAccessors[sortKey]) {
      const getter = sortAccessors[sortKey];
      const dir = sortDir === 'asc' ? 1 : -1;
      out = [...out].sort((a, b) => compareValues(getter(a), getter(b)) * dir);
    }

    return out;
  }, [items, query, filterValues, sortKey, sortDir, searchFields, filters, sortAccessors]);

  const setFilter = (key, value) =>
    setFilterValues((prev) => ({ ...prev, [key]: value }));

  const clearAll = () => {
    setQuery('');
    setFilterValues({});
  };

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    }
  };

  return {
    rows,
    query,
    setQuery,
    filterValues,
    setFilter,
    clearAll,
    sortKey,
    sortDir,
    toggleSort,
  };
}
