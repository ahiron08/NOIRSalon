import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { apiFetch } from '../services/api.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { apiFetch('/content/blogs').then((j) => setPosts(j.data || [])).catch(() => {}); }, []);
  return (
    <>
      <PageHeader title="Journal" subtitle="NOIR Editorial" />
      <Section>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <motion.article key={p._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border border-white/10 bg-white/[0.03]">
              <div className="aspect-[16/9] w-full bg-neutral-900" />
              <div className="p-6">
                <h3 className="font-display text-2xl text-white">{p.title}</h3>
                <p className="mt-2 text-noir-muted">{p.excerpt}</p>
                <Link to={`/blog/${p.slug}`} className="mt-4 inline-flex text-noir-gold">Read →</Link>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>
    </>
  );
}
