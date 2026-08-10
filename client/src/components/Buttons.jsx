import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBookmark, FaRegGem } from 'react-icons/fa';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Magnetic wrapper — gently pulls its child toward the cursor.
 */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={'inline-block ' + className}
    >
      {children}
    </motion.div>
  );
}

/**
 * BOOK APPOINTMENT — solid black, gold border, gold glow on hover.
 */
export function BookButton({ label = 'Book Appointment', href = '/reservations', delay = 0 }) {
  return (
    <Magnetic>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        <Link
          to={href}
          data-cursor
          className="group relative inline-flex items-center justify-center gap-3 overflow-hidden border border-noir-gold/60 px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.28em] transition-all duration-500 gold-glow bg-black text-noir-gold hover:scale-[1.03] hover:bg-noir-gold hover:text-black"
        >
          <FaBookmark className="text-xs transition-transform duration-500 group-hover:-rotate-6" />
          <span className="relative z-10">{label}</span>
        </Link>
      </motion.div>
    </Magnetic>
  );
}

/**
 * EXPLORE SERVICES — transparent, white border, fills softly on hover.
 */
export function ExploreButton({ label = 'Explore Services', href = '/services', delay = 0 }) {
  return (
    <Magnetic>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        <Link
          to={href}
          data-cursor
          className="group relative inline-flex items-center justify-center gap-3 overflow-hidden border border-white/40 px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.28em] transition-all duration-500 bg-transparent text-white hover:scale-[1.03] hover:border-white hover:bg-white/[0.06]"
        >
          <FaRegGem className="text-xs text-noir-gold/80" />
          <span className="relative z-10">{label}</span>
        </Link>
      </motion.div>
    </Magnetic>
  );
}
