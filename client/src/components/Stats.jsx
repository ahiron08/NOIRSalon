import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

const STATS = [
  { value: '12+', label: 'Years Experience' },
  { value: '40+', label: 'Professionals' },
  { value: '50K+', label: 'Happy Clients' },
];

/**
 * Minimal floating glassmorphism stat cards.
 * - variant="column": vertical stack for the desktop right side of the hero.
 * - variant="row":   a 2×2 grid for tablet / mobile.
 */
export default function Stats({ visible = true, variant = 'column', delay = 0 }) {
  return (
    <div
      className={
        variant === 'column'
          ? 'hidden flex-col gap-4 lg:flex'
          : 'grid grid-cols-2 gap-3 sm:gap-4'
      }
    >
      {variant === 'column' && (
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ delay: delay + 0.35, duration: 0.9, ease: EASE }}
        >
          <div className="glass flex items-center gap-3 px-6 py-5">
            <span className="font-display text-3xl text-noir-gold">★</span>
            <div>
              <div className="font-display text-2xl leading-none text-white">4.9</div>
              <div className="mt-1 text-[0.6rem] uppercase tracking-[0.25em] text-noir-muted">
                Client Rating
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            delay: delay + i * 0.14 + (variant === 'column' ? 0.45 : 0.2),
            duration: 0.9,
            ease: EASE,
          }}
        >
          <div className="glass group px-6 py-5 transition-all duration-500 hover:-translate-y-1 hover:border-noir-gold/30 hover:bg-white/[0.06]">
            <div className="font-display text-3xl leading-none text-white transition-colors duration-500 group-hover:text-noir-gold lg:text-4xl">
              {s.value}
            </div>
            <div className="mt-2 text-[0.6rem] uppercase tracking-[0.25em] text-noir-muted">
              {s.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
