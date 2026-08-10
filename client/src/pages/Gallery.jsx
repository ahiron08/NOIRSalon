import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

import { apiFetch } from '../services/api.js';
const FILTERS = ['All', 'hair', 'makeup', 'bridal', 'facial', 'nail', 'men'];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [feed, setFeed] = useState(null);

  useEffect(() => {
    (async () => {
      const base = '/content/gallery';
      const qs = filter !== 'All' ? `?category=${filter}` : '';
      try {
        const res = await apiFetch(base + qs);
        setItems(res.data || []);
      } catch (err) {
        console.error('Failed to load gallery:', err);
        setItems([]);
      }
    })();
  }, [filter]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/content/instagram?limit=12');
        setFeed(res && res.success ? res : null);
      } catch (err) {
        console.error('Failed to load Instagram feed:', err);
        setFeed(null);
      }
    })();
  }, []);

  const openLightbox = (item) => {
    const videoUrl = item.videoUrl || item.reelUrl;
    setLightbox({
      mediaType: videoUrl ? 'reel' : 'image',
      image: item.image,
      videoUrl: videoUrl || '',
      permalink: item.permalink,
      title: item.title || item.caption || '',
    });
  };

  return (
    <>
      <PageHeader title="Gallery" subtitle="Portfolio" />
      <Section>
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`border px-5 py-2 text-xs uppercase tracking-[0.25em] ${filter === f ? 'border-noir-gold text-noir-gold' : 'border-white/20 text-noir-muted'}`}>
              {f}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-noir-muted">No portfolio items yet.</p>
        ) : (
          <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((img, i) => (
              <motion.button key={img._id} type="button" onClick={() => openLightbox(img)}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="group relative mb-4 block w-full overflow-hidden border border-white/10 bg-white/[0.03]">
                <div className="relative aspect-[3/4] w-full bg-neutral-900">
                  <img src={img.image} alt={img.title || ''} loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {img.mediaType === 'reel' && (
                    <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-white">
                      ▶ Reel
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </Section>
{/* Live Instagram feed — posts & reels */}
      <Section eyebrow="Follow along" title="NOIR on Instagram" subtitle="Fresh looks, reels and behind-the-chair moments — straight from the feed.">
        {feed && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <a href={feed.account?.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-white transition-colors hover:text-noir-gold">
              <FaInstagram className="text-2xl" />
              <span className="font-display text-2xl">@{feed.account?.username}</span>
            </a>
            {feed.live ? (
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-noir-gold">
                <span className="h-2 w-2 rounded-full bg-noir-gold" /> Live feed
              </span>
            ) : (
              <span className="text-xs uppercase tracking-[0.25em] text-noir-muted">Curated picks</span>
            )}
          </div>
        )}

        {feed && feed.data && feed.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {feed.data.map((m, i) => (
              <motion.a key={m.id} href={m.permalink || feed.account?.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="group relative block aspect-square w-full overflow-hidden border border-white/10 bg-neutral-900">
                <img src={m.image} alt={m.caption || ''} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <FaInstagram /> {m.mediaType === 'reel' ? 'Reel' : 'Post'}
                  </div>
                </div>
                {m.mediaType === 'reel' && (
                  <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-white">▶ Reel</span>
                )}
              </motion.a>
            ))}
          </div>
        ) : (
          <p className="text-noir-muted">No Instagram content yet. Add “Instagram import” items in the admin Gallery panel, or configure an Instagram Graph API token.</p>
        )}
      </Section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-6" onClick={() => setLightbox(null)}>
          <div className="relative max-h-[85vh] max-w-[90vw]">
            {lightbox.mediaType === 'reel' ? (
              <video src={lightbox.videoUrl} poster={lightbox.image} controls autoPlay
                className="max-h-[85vh] max-w-[90vw] object-contain" />
            ) : (
              <img src={lightbox.image} className="max-h-[85vh] max-w-[90vw] object-contain" alt={lightbox.title || ''} />
            )}
            {lightbox.permalink && (
              <a href={lightbox.permalink} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 right-4 flex items-center gap-2 border border-noir-gold/60 bg-black/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-noir-gold">
                <FaInstagram /> View on Instagram
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}