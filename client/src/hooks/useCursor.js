import { useEffect, useState } from 'react';

/**
 * Provides the state wiring for the bespoke custom cursor.
 * Disables itself entirely on coarse-pointer (touch) devices.
 *
 * Returns:
 *  - enabled  : whether a fine pointer is present
 *  - hovering : whether the cursor currently sits over a target
 *  - handlers : mousemove handler to attach to the window
 */
export default function useCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    setEnabled(fine);
    if (!fine) return undefined;

    const onMove = (e) => {
      const target = e.target.closest && e.target.closest('a, button, [data-cursor], input, textarea');
      setHovering(Boolean(target));
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return { enabled, hovering };
}
