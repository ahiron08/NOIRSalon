import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function About() {
  return (
    <>
      <PageHeader title="About NOIR" subtitle="Our Story" />
      <Section eyebrow="Est. in Guwahati" title="Redefining luxury in East India" subtitle="We started NOIR to do one thing: prove that a salon can be a luxury brand. No noise. No compromises. Just quiet, confident excellence.">
        <div className="grid gap-12 lg:grid-cols-2">
          {['Every detail is designed to feel considered, from the lighting to the soundscape. We import our products. We invest in our people. We never rush.','With private suites, strict hygiene protocols, and a handpicked team of artists, NOIR is where discipline meets desire.','East India\'s Largest Luxury Salon is not a tagline — it is a standard. One visit will make the difference obvious.'].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="border border-white/10 p-8">
              <p className="text-noir-muted">{p}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
