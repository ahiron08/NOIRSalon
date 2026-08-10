import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { BookButton } from '../components/Buttons.jsx';

const CATEGORIES = ['All', 'Hair', 'Hair Spa', 'Facial', 'Makeup', 'Nails', 'Body', 'Men'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const base = '/api/v1/content/products';
        const qs = active !== 'All' ? `?category=${encodeURIComponent(active.toLowerCase())}` : '';
        const res = await fetch(base + qs);
        const json = await res.json();
        setProducts(json.data || []);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [active]);

  return (
    <>
      <PageHeader title="Products" subtitle="Shop" />
      <Section>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <button 
              key={c} 
              onClick={() => setActive(c)} 
              className={`border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-500 ${active === c ? 'border-noir-gold text-noir-gold' : 'border-white/20 text-noir-muted hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full animate-pulse bg-neutral-900" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <motion.div 
                key={p._id} 
                initial={{ opacity: 0, y: 24 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} 
                className="group overflow-hidden border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-[3/4] w-full bg-neutral-900 relative overflow-hidden">
                  {p.image && (
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  {p.compareAtPrice > p.price && (
                    <span className="absolute top-3 right-3 bg-noir-gold text-black text-[0.65rem] uppercase tracking-wider px-2 py-1">
                      Sale
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-white">{p.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-noir-muted">{p.brand}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-noir-gold text-lg">₹{p.price}</span>
                      {p.compareAtPrice > p.price && (
                        <span className="ml-2 text-sm text-noir-muted line-through">₹{p.compareAtPrice}</span>
                      )}
                    </div>
                    {p.rating > 0 && (
                      <span className="text-xs text-noir-gold">★ {p.rating}</span>
                    )}
                  </div>
                  {p.stock > 0 ? (
                    <BookButton label="Add to Cart" href={`/products/${p.slug}`} delay={0} />
                  ) : (
                    <span className="mt-4 inline-block text-xs uppercase tracking-wider text-noir-muted">Out of Stock</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}