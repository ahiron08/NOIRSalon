import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

const ROLES = ['Senior Hair Stylist', 'Makeup Artist', 'Spa Therapist', 'Receptionist', 'Social Media Manager'];

export default function Careers() {
  return (
    <>
      <PageHeader title="Careers" subtitle="Join NOIR" />
      <Section eyebrow="Work with us" title="Craft your future" subtitle="We hire the obsessive, the precise, the restless.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r, i) => (
            <motion.div key={r} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="border border-white/10 p-8">
              <h3 className="font-display text-2xl text-white">{r}</h3>
              <p className="mt-2 text-noir-muted">Full-time. Competitive. Luxury environment.</p>
              <button className="mt-6 border border-noir-gold/60 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black">Apply</button>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
