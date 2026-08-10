import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function Membership() {
  const [plans, setPlans] = useState([]);
  useEffect(() => { fetch('/api/v1/content/memberships').then((r) => r.json()).then((j) => setPlans(j.data || [])); }, []);
  return (
    <>
      <PageHeader title="Membership" subtitle="Privileges" />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border border-white/10 bg-white/[0.03]">
              <div className="p-8">
                <h3 className="font-display text-3xl text-white">{p.name}</h3>
                <p className="mt-2 text-sm text-noir-gold">{p.tagline}</p>
                <div className="mt-4 text-4xl text-white">₹{p.price}<span className="text-sm text-noir-muted">/{p.billing}</span></div>
                <ul className="mt-6 space-y-2 text-sm text-noir-muted">
                  {p.perks.map((x) => <li key={x} className="flex items-center gap-3"><span className="h-px w-6 bg-noir-gold/70" />{x}</li>)}
                </ul>
                <button className="mt-8 w-full border border-noir-gold/60 py-3 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black">Join Now</button>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
