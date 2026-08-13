import { useState, useEffect, useRef } from 'react';

/**
 * NOIR-styled custom dropdown (accessible + keyboard friendly).
 *
 * Props
 *   value     current value (compared loosely against option.value)
 *   onChange  (value) => void
 *   options   [{ value, label, disabled? }]
 *   placeholder
 *   disabled
 *   invalid   highlights the trigger with a red border
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  invalid = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(() =>
    Math.max(0, options.findIndex((o) => String(o.value) === String(value)))
  );
  const rootRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value)) || null;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, options.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }
      if (e.key === 'Enter' && open && highlight >= 0 && options[highlight] && !options[highlight].disabled) {
        e.preventDefault();
        onChange(options[highlight].value);
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, highlight, options, onChange]);

  const triggerBorder = invalid
    ? 'border-red-500/70'
    : open
      ? 'border-noir-gold/70'
      : 'border-white/15';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between border bg-transparent px-4 py-3 text-left text-sm outline-none transition-colors ${triggerBorder} ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer focus:border-noir-gold/60'
        } ${selected ? 'text-white' : 'text-noir-muted'}`}
      >
        <span className="truncate pr-6">{selected ? selected.label : placeholder}</span>
        <svg
          className={`pointer-events-none h-4 w-4 shrink-0 text-noir-muted transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto border border-white/10 bg-neutral-950/95 shadow-2xl backdrop-blur">
          {options.map((o, i) => {
            const isSelected = String(o.value) === String(value);
            const isHighlight = highlight === i;
            return (
              <button
                key={o.value}
                type="button"
                disabled={o.disabled}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => {
                  if (!o.disabled) {
                    onChange(o.value);
                    setOpen(false);
                  }
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:text-noir-muted/40 ${
                  isSelected
                    ? 'bg-noir-gold/15 text-noir-gold'
                    : isHighlight
                      ? 'bg-white/5 text-white'
                      : 'text-white/80'
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && (
                  <svg className="h-4 w-4 shrink-0 text-noir-gold" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-noir-muted">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}
