import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Masked text reveal — content slides up out of a clipped wrapper
 * (editorial, quiet — never a bounce).
 *
 * props:
 *  - delay : stagger delay in seconds
 *  - y     : starting translate (default '110%')
 *  - once  : when true, run only the first time it enters the viewport
 */
export default function Reveal({ children, delay = 0, y = '110%', className = '', once = true }) {
  return (
    <span className={'block overflow-hidden ' + className}>
      <motion.span
        className="block"
        initial={{ y, opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once, margin: '-10% 0px' }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}
