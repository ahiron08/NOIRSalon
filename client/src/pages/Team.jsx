import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { apiFetch } from '../services/api.js';

export default function Team() {
  const [stylists, setStylists] = useState([]);
  useEffect(() => { apiFetch('/content/stylists').then((j) => setStylists(j.data || [])).catch(() => {}); }, []);
  return (
    <>
      <PageHeader title="Meet the Team" subtitle="Artists" />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stylists.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border border-white/10">
              <div className="aspect-[3/4] w-full bg-neutral-900" />
              <div className="p-5">
                <h3 className="font-display text-xl text-white">{s.name}</h3>
                <p className="text-xs uppercase tracking-[0.25em] text-noir-gold">{s.role}</p>
                <p className="mt-2 text-sm text-noir-muted">{s.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
