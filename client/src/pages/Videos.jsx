import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function Videos() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch('/api/v1/content/videos').then((r) => r.json()).then((j) => setItems(j.data || [])); }, []);
  return (
    <>
      <PageHeader title="Videos" subtitle="Cinematic" />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((v, i) => (
            <motion.div key={v._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-video w-full bg-neutral-900">
                <video className="h-full w-full object-cover" src={v.file || '/videos/hero.mp4'} poster={v.thumbnail} autoPlay muted loop playsInline />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl text-white">{v.title}</h3>
                <p className="mt-2 text-noir-muted">{v.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
