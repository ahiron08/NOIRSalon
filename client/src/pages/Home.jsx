import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Stats from '../components/Stats.jsx';
import { BookButton, ExploreButton } from '../components/Buttons.jsx';
import Section from '../components/layout/Section.jsx';

const HEADLINE = ["EAST INDIA'S", 'LARGEST', 'LUXURY SALON'];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <section id="home" className="relative h-screen overflow-hidden bg-black">
        {/* Static hero background -- background video removed */}
        <div className="absolute inset-0 bg-black" />
        <motion.div
          className="relative z-20 flex h-full items-center"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } } }}
        >
          <div className="container-noir w-full">
            <motion.div className="max-w-4xl">
              <motion.p
                variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } }}
                className="eyebrow mb-8 flex items-center gap-4"
              >
                <span className="h-px w-10 bg-noir-gold/70" />
                NOIR SALON -- GUWAHATI
              </motion.p>

              <h1 className="font-display text-[13.5vw] leading-[0.95] text-white sm:text-7xl lg:text-8xl xl:text-[7rem]">
                {HEADLINE.map((line) => (
                  <span key={line} className="block overflow-hidden">
                    <motion.span
                      className="block"
                      variants={{
                        hidden: { y: '115%', opacity: 0 },
                        show: { y: '0%', opacity: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
                className="mt-8 max-w-md text-sm font-light leading-relaxed text-noir-muted md:mt-10 md:text-base"
              >
                Experience luxury styling, premium beauty treatments and unmatched elegance crafted by industry-leading professionals.
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
                className="mt-12 flex flex-wrap items-center gap-4 md:mt-14 md:gap-6"
              >
                <BookButton delay={0} />
                <ExploreButton delay={0.1} href="/home/services" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 lg:right-14 lg:block"><Stats visible variant="column" /></div>
        <div className="absolute inset-x-0 bottom-28 z-20 hidden sm:block lg:hidden"><div className="container-noir"><Stats visible variant="row" /></div></div>
      </section>

      {/* SERVICES PREVIEW */}
      <Section eyebrow="Crafted with care" title="Luxury Services" subtitle="From precision cuts to advanced skin therapies — every service is a ceremony.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {['Haircut & Styling', 'Signature Facial', 'Bridal Makeup', 'Swedish Massage'].map((name, i) => (
            <motion.div key={name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="group overflow-hidden border border-white/10 bg-white/[0.03]">
              <div className="aspect-[4/5] w-full bg-neutral-900" />
              <div className="p-6">
                <h3 className="font-display text-2xl text-white">{name}</h3>
                <p className="mt-1 text-noir-muted">Relax and rejuvenate.</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-noir-gold">₹899</span>
                    <span className="ml-2 text-xs text-noir-muted line-through">₹1,299</span>
                  </div>
                  <span className="text-xs text-noir-muted">60 min</span>
                </div>
                <Link to="/home/services" className="mt-5 inline-flex border border-noir-gold/60 px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black">View Details</Link>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10"><Link to="/home/combos" className="inline-flex items-center border border-white/40 px-8 py-3.5 text-xs uppercase tracking-[0.28em] text-white hover:border-noir-gold hover:text-noir-gold">View All Combos</Link></div>
      </Section>

      {/* WHY CHOOSE */}
      <Section eyebrow="The NOIR difference" title="Why Choose NOIR" subtitle="We don't do ordinary. Every touchpoint is considered.">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {['Industry-leading professionals', 'Imported luxury products', 'Personalized consultations', 'Strict hygiene standards', 'Private treatment suites', "Guwahati's finest address"].map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="border border-white/10 p-8">
              <div className="h-px w-8 bg-noir-gold/70 mb-5" />
              <p className="font-display text-xl text-white">{t}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* STYLISTS PREVIEW */}
      <Section eyebrow="Meet the artists" title="Featured Stylists" subtitle="Masters of their craft.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {['Ananya Sharma', 'Rohit Bora', 'Priya Kalita', 'Aman Choudhury'].map((name, i) => (
            <motion.div key={name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border border-white/10">
              <div className="aspect-[3/4] w-full bg-neutral-900" />
              <div className="p-5">
                <h3 className="font-display text-xl text-white">{name}</h3>
                <p className="text-xs uppercase tracking-[0.25em] text-noir-gold">Senior Stylist</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10"><Link to="/home/team" className="inline-flex items-center border border-white/40 px-8 py-3.5 text-xs uppercase tracking-[0.28em] text-white hover:border-noir-gold hover:text-noir-gold">View Team</Link></div>
      </Section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-black">
        <div className="container-noir flex flex-col items-center justify-between gap-8 py-20 md:flex-row">
          <div>
            <h3 className="font-display text-3xl text-white md:text-5xl">Ready to feel NOIR?</h3>
            <p className="mt-3 text-noir-muted">Book an appointment or explore our membership.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/home/reservations" className="border border-noir-gold/60 px-8 py-3.5 text-xs uppercase tracking-[0.28em] text-noir-gold hover:bg-noir-gold hover:text-black">Book Appointment</Link>
            <Link to="/home/membership" className="border border-white/40 px-8 py-3.5 text-xs uppercase tracking-[0.28em] text-white hover:border-noir-gold hover:text-noir-gold">Membership</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
