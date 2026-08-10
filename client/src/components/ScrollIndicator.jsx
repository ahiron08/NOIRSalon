import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Bottom-center scroll cue — a minimal animated gold mouse.
 * Fades in once the homepage is revealed, and dissolves away on scroll.
 */
export default function ScrollIndicator({ visible = true }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && !scrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-3" data-cursor>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 pt-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="h-1.5 w-1 rounded-full bg-noir-gold"
              />
            </motion.div>
            <span className="text-[0.55rem] uppercase tracking-[0.4em] text-noir-muted">
              Scroll
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
