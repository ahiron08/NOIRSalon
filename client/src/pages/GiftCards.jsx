import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

const ITEMS = [
  { name: 'Spa Gift Card ₹1000', price: 1000, tag: 'Perfect for a facial' },
  { name: 'Spa Gift Card ₹2000', price: 2000, tag: 'Luxury mani-pedi' },
  { name: 'Spa Gift Card ₹5000', price: 5000, tag: 'Full day of luxury' },
  { name: 'Spa Gift Card ₹10000', price: 10000, tag: 'Ultimate NOIR experience' },
];

export default function GiftCards() {
  return (
    <>
      <PageHeader title="Gift Cards" subtitle="The gift of luxury" />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((g, i) => (
            <motion.div key={g.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border border-white/10 bg-white/[0.03] p-8">
              <h3 className="font-display text-2xl text-white">{g.name}</h3>
              <p className="mt-2 text-noir-gold">₹{g.price}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-noir-muted">{g.tag}</p>
              <button className="mt-6 w-full border border-noir-gold/60 py-2.5 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black">Buy Now</button>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
