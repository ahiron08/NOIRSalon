import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import useCursor from '../hooks/useCursor.js';

/**
 * Bespoke luxury cursor - golden dot with trailing halo.
 */
export default function Cursor() {
  const { enabled, hovering } = useCursor();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const dotX = useSpring(mouseX, { stiffness: 900, damping: 45, mass: 0.35 });
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 45, mass: 0.35 });
  const haloX = useSpring(mouseX, { stiffness: 220, damping: 24, mass: 0.6 });
  const haloY = useSpring(mouseY, { stiffness: 220, damping: 24, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [enabled, mouseX, mouseY]);

  console.log('Cursor render - enabled:', enabled);

  return (
    <>
      {/* halo ring */}
      <motion.div
        aria-hidden
        style={{ x: haloX, y: haloY }}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
      >
        <motion.div
          className="-ml-[18px] -mt-[18px] h-9 w-9 rounded-full border-2 border-[#D4AF37]"
          animate={{
            scale: hovering ? 1.9 : 1,
            opacity: hovering ? 0.75 : 0.5,
          }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </motion.div>

      {/* core dot */}
      <motion.div
        aria-hidden
        style={{ x: dotX, y: dotY }}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
      >
        <motion.div
          className="-ml-[4px] -mt-[4px] h-2 w-2 rounded-full bg-[#D4AF37]"
          animate={{ scale: hovering ? 0.5 : 1 }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </motion.div>
    </>
  );
}