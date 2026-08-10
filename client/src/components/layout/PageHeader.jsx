import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function PageHeader({ title, subtitle }) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-black py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-noir-gold/[0.04]" />
      <div className="container-noir relative z-10">
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }} className="eyebrow mb-4">
          {subtitle}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE }} className="font-display text-5xl leading-none text-white md:text-7xl lg:text-8xl">
          {title}
        </motion.h1>
      </div>
    </header>
  );
}
