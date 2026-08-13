import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { apiFetch } from '../services/api.js';
import { useCart } from '../contexts/CartContext.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [added, setAdded] = useState({});

  // Load real categories so the chips match the DB and filter by slug.
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/content/categories');
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

  const handleAdd = async (productId) => {
    try {
      await addItem(productId, 1);
      setAdded((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => setAdded((prev) => ({ ...prev, [productId]: false })), 1500);
    } catch { /* silently ignore */ }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const base = '/content/products';
        const qs = active !== 'all' ? `?category=${encodeURIComponent(active)}` : '';
        const json = await apiFetch(base + qs);
        // json already parsed by apiFetch
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
          <button
            onClick={() => setActive('all')}
            className={`border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-500 ${active === 'all' ? 'border-noir-gold text-noir-gold' : 'border-white/20 text-noir-muted hover:text-white'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setActive(c.slug)}
              className={`border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-500 ${active === c.slug ? 'border-noir-gold text-noir-gold' : 'border-white/20 text-noir-muted hover:text-white'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full animate-pulse bg-neutral-900" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 border border-white/10 bg-white/[0.02] p-12 text-center text-noir-muted">
            No products in this category yet.
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
                    <button
                      onClick={() => handleAdd(p._id)}
                      data-cursor
                      className="mt-4 inline-flex items-center justify-center gap-2 border border-noir-gold/60 px-5 py-2.5 text-[0.68rem] font-medium uppercase tracking-[0.25em] text-noir-gold transition-all duration-500 hover:bg-noir-gold hover:text-black"
                    >
                      {added[p._id] ? 'Added ✓' : 'Add to Cart'}
                    </button>
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