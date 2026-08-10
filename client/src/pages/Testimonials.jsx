import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function Testimonials() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch('/api/v1/content/testimonials').then((r) => r.json()).then((j) => setItems(j.data || [])); }, []);
  return (
    <>
      <PageHeader title="Testimonials" subtitle="Kind Words" />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="border border-white/10 p-8">
              <div className="text-noir-gold">{"★".repeat(t.rating)}</div>
              <p className="mt-4 text-noir-muted">"{t.text}"</p>
              <div className="mt-6 text-sm text-white">{t.name}</div>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
