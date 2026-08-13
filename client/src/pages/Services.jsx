import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { apiFetch } from '../services/api.js';

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load the real service categories from the CMS so the filter chips always
  // reflect what's actually in the database (name + slug used for filtering).
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/content/categories?type=service');
        const items = (res.data || [])
          .filter((c) => c.active !== false)
          .map((c) => ({
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          }));
        setCategories(items);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const base = '/content/services';
        // Filter by category slug; the backend resolves it to the ObjectId.
        const qs = active !== 'all' ? `?category=${encodeURIComponent(active)}` : '';
        const res = await apiFetch(base + qs);
        setServices(res.data || []);
      } catch (e) {
        console.error('Failed to load services', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [active]);

  return (
    <>
      <PageHeader title="Services" subtitle="Catalogue" />
      <Section>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setActive('all')} className={`border px-5 py-2 text-xs uppercase tracking-[0.25em] ${active === 'all' ? 'border-noir-gold text-noir-gold' : 'border-white/20 text-noir-muted hover:text-white'}`}>All</button>
          {categories.map((c) => (
            <button key={c.slug} onClick={() => setActive(c.slug)} className={`border px-5 py-2 text-xs uppercase tracking-[0.25em] ${active === c.slug ? 'border-noir-gold text-noir-gold' : 'border-white/20 text-noir-muted hover:text-white'}`}>{c.name}</button>
          ))}
        </div>
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] w-full animate-pulse bg-neutral-900" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-10 border border-white/10 bg-white/[0.02] p-12 text-center text-noir-muted">
            No services in this category yet.
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
                  <div className="mt-5 flex items-center gap-3">
                    <Link to={`/services/${s.slug}`} className="inline-flex border border-white/20 px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.25em] text-noir-muted hover:border-noir-gold hover:text-noir-gold">View Details</Link>
                    <Link to={`/home/reservations?service=${s._id}`} className="inline-flex border border-noir-gold/60 px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black">Book Now</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
