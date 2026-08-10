import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { BookButton } from '../components/Buttons.jsx';

const ITEMS = [
  { name: 'Bride To Be', originalPrice: 25000, offerPrice: 19999, tag: 'Save ₹5,001' },
  { name: 'Luxury Groom Package', originalPrice: 12000, offerPrice: 9999, tag: 'Save ₹2,001' },
  { name: 'Weekend Glow', originalPrice: 6000, offerPrice: 4999, tag: 'Save ₹1,001' },
  { name: 'Royal Hair Spa', originalPrice: 4500, offerPrice: 3499, tag: 'Save ₹1,001' },
  { name: 'Couple Makeover', originalPrice: 10000, offerPrice: 8499, tag: 'Save ₹1,501' },
  { name: 'Student Package', originalPrice: 3000, offerPrice: 1999, tag: 'Save ₹1,001' },
];

export default function Combos() {
  return (
    <>
      <PageHeader title="Combos" subtitle="Curated Packages" />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border border-white/10 bg-white/[0.03]">
              <div className="aspect-[4/5] w-full bg-neutral-900" />
              <div className="p-6">
                <h3 className="font-display text-2xl text-white">{item.name}</h3>
                <div className="mt-3">
                  <span className="text-noir-gold">₹{item.offerPrice}</span>
                  <span className="ml-2 text-sm text-noir-muted line-through">₹{item.originalPrice}</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-noir-gold">{item.tag}</p>
                <BookButton label="Book Now" delay={0} />
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
