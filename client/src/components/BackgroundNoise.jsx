import { motion } from 'framer-motion';

/**
 * Fixed, non-interactive layer that adds:
 *  1. a barely-visible film-grain (SVG noise)
 *  2. two tiny, slow, drifting gradients
 * Both sit behind all content so nothing feels flat, yet nothing sparkles.
 */
export default function BackgroundNoise() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {/* film grain */}
      <div
        className="absolute -inset-[50%] opacity-[0.04] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* drifting gradients — nearly invisible */}
      <motion.div
        aria-hidden
        className="absolute -left-1/4 top-[-20%] h-[60vh] w-[60vw] rounded-full bg-noir-gold/[0.05] blur-[140px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-1/4 bottom-[-20%] h-[55vh] w-[55vw] rounded-full bg-white/[0.04] blur-[150px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
