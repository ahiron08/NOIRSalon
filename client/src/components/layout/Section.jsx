import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function Section({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <section className={'container-noir relative z-10 py-20 md:py-28 ' + className}>
      {(eyebrow || title) && (
        <div className="mb-12 max-w-3xl">
          {eyebrow && <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} className="eyebrow mb-3">{eyebrow}</motion.p>}
          {title && <motion.h2 initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE }} className="font-display text-4xl text-white md:text-6xl">{title}</motion.h2>}
          {subtitle && <motion.p initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1, ease: EASE }} className="mt-4 text-noir-muted">{subtitle}</motion.p>}
        </div>
      )}
      {children}
    </section>
  );
}
