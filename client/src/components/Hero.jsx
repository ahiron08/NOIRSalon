import { motion } from 'framer-motion';
import HeroVideo from './HeroVideo.jsx';
import Stats from './Stats.jsx';
import ScrollIndicator from './ScrollIndicator.jsx';
import { BookButton, ExploreButton } from './Buttons.jsx';

const EASE = [0.22, 1, 0.36, 1];

const HEADLINE = [
  "EAST INDIA'S",
  'LARGEST',
  'LUXURY SALON',
];

/**
 * Full-viewport homepage hero — masked editorial headline over the
 * continuing cinematic background video, with right-side stats.
 */
export default function Hero({ play }) {
  return (
    <section id="home" className="relative h-screen overflow-hidden bg-black">
      <HeroVideo
        src="/videos/hero.mp4"
        play={play}
        overlay="rgba(0,0,0,0.55)"
      />

      {/* content */}
      <motion.div
        className="relative z-20 flex h-full items-center"
        initial="hidden"
        animate={play ? 'show' : 'hidden'}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } } }}
      >
        <div className="container-noir w-full">
          <motion.div className="max-w-4xl">
            {/* eyebrow */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } } }}
              className="eyebrow mb-8 flex items-center gap-4"
            >
              <span className="h-px w-10 bg-noir-gold/70" />
              NOIR SALON&nbsp;&nbsp;—&nbsp;&nbsp;GUWAHATI
            </motion.p>

            {/* headline */}
            <h1 className="font-display text-[13.5vw] leading-[0.95] text-white sm:text-7xl lg:text-8xl xl:text-[7rem]">
              {HEADLINE.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    variants={{
                      hidden: { y: '115%', opacity: 0 },
                      show: { y: '0%', opacity: 1, transition: { duration: 1.2, ease: EASE } },
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* body copy */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.4, ease: EASE } } }}
              className="mt-8 max-w-md text-sm font-light leading-relaxed text-noir-muted md:mt-10 md:text-base"
            >
              Experience luxury styling, premium beauty treatments and unmatched elegance
              crafted by industry-leading professionals.
            </motion.p>

            {/* buttons */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.6, ease: EASE } } }}
              className="mt-12 flex flex-wrap items-center gap-4 md:mt-14 md:gap-6"
            >
              <BookButton delay={0} />
              <ExploreButton delay={0.1} />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* right-side desktop stats */}
      <div className="absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 lg:right-14 lg:block">
        <Stats visible={play} variant="column" />
      </div>

      {/* tablet stats strip */}
      <div className="absolute inset-x-0 bottom-28 z-20 hidden sm:block lg:hidden">
        <div className="container-noir">
          <Stats visible={play} variant="row" />
        </div>
      </div>

      <ScrollIndicator visible={play} />
    </section>
  );
}
