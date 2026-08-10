import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { apiFetch } from '../services/api.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    await apiFetch('/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSent(true);
  };
  return (
    <>
      <PageHeader title="Contact" subtitle="Get in touch" />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <form onSubmit={submit} className="grid gap-6">
            {[['name','Full Name',''],['email','Email',''],['phone','Phone',''],['subject','Subject','']].map(([k,l,ph]) => (
              <div key={k}>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">{l}</label>
                <input required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph} className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60" />
              </div>
            ))}
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Message</label>
              <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60" />
            </div>
            <button type="submit" className="border border-noir-gold/60 px-8 py-3.5 text-xs uppercase tracking-[0.28em] text-noir-gold hover:bg-noir-gold hover:text-black">Send Message</button>
          </form>
          <div className="space-y-6 text-noir-muted">
            <p><strong className="text-white">NOIR SALON</strong><br/>GS Road, Guwahati, Assam</p>
            <p>hello@noirsalon.in</p>
            <p>+91 98765 43210</p>
            <p>Mon–Sun: 10:00–20:00</p>
          </div>
        </div>
        {sent && <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-10 border border-noir-gold/60 p-8"><h3 className="font-display text-3xl text-white">Message sent.</h3></motion.div>}
      </Section>
    </>
  );
}
