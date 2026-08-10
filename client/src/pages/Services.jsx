import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { BookButton } from '../components/Buttons.jsx';
import { apiFetch } from '../services/api.js';

const CATEGORIES = ['All', 'Hair', 'Hair Spa', 'Facial', 'Makeup', 'Nails', 'Body', 'Men'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const base = '/content/services';
      const qs = active !== 'All' ? `?category=${encodeURIComponent(active.toLowerCase())}` : '';
      const res = await apiFetch(base + qs);
      setServices(res.data || []);
      setLoading(false);
    })();
  }, [active]);

  return (
    <>
      <PageHeader title="Services" subtitle="Catalogue" />
      <Section>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setActive(c)} className={`border px-5 py-2 text-xs uppercase tracking-[0.25em] ${active === c ? 'border-noir-gold text-noir-gold' : 'border-white/20 text-noir-muted hover:text-white'}`}>{c}</button>
          ))}
        </div>
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] w-full animate-pulse bg-neutral-900" />)}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="group overflow-hidden border border-white/10 bg-white/[0.03]">
                <div className="aspect-[4/5] w-full bg-neutral-900" />
                <div className="p-6">
                  <h3 className="font-display text-2xl text-white">{s.name}</h3>
                  <p className="mt-1 text-noir-muted">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-noir-gold">₹{s.offerPrice || s.price}</span>
                      {s.offerPrice && <span className="ml-2 text-xs text-noir-muted line-through">₹{s.price}</span>}
                    </div>
                    <span className="text-xs text-noir-muted">{s.duration} min</span>
                  </div>
                  <Link to={`/services/${s.slug}`} className="mt-5 inline-flex border border-noir-gold/60 px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black">View Details</Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
