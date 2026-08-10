import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function Reservations() {
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form, setForm] = useState({
    service: '',
    stylist: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [svcRes, stylistRes] = await Promise.all([
          fetch('/api/v1/content/services'),
          fetch('/api/v1/content/stylists')
        ]);
        const [svcData, stylistData] = await Promise.all([
          svcRes.json(),
          stylistRes.json()
        ]);
        setServices(svcData.data || []);
        setStylists(stylistData.data || []);
      } catch (e) {
        console.error('Failed to load options', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!form.date || !form.stylist) {
      setAvailableSlots([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/v1/appointments/slots?date=${form.date}&stylist=${form.stylist}`);
        const json = await res.json();
        setAvailableSlots(json.taken || []);
      } catch (e) {
        console.error('Failed to load slots', e);
      }
    })();
  }, [form.date, form.stylist]);

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  const selectedService = services.find(s => s._id === form.service);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          services: form.service ? [form.service] : [],
          combos: []
        }),
        credentials: 'include'
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error('Booking failed', e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <PageHeader title="Reservations" subtitle="Book an appointment" />
        <Section>
          <motion.div 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mx-auto max-w-2xl border border-noir-gold/60 p-8 text-center"
          >
            <h3 className="font-display text-3xl text-white">Booking Confirmed</h3>
            <p className="mt-4 text-noir-muted">
              Thank you, {form.name}. Your appointment for <strong className="text-white">{selectedService?.name}</strong> on <strong className="text-white">{new Date(form.date).toLocaleDateString()}</strong> at <strong className="text-white">{form.time}</strong> has been received.
            </p>
            <p className="mt-4 text-sm text-noir-muted">We will confirm your booking shortly via phone or email.</p>
          </motion.div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Reservations" subtitle="Book an appointment" />
      <Section>
        <form onSubmit={submit} className="mx-auto max-w-3xl grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Service</label>
              <select 
                required
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-noir-gold/60"
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id} className="bg-black">
                    {s.name} — ₹{s.offerPrice || s.price} ({s.duration} min)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Stylist</label>
              <select 
                required
                value={form.stylist}
                onChange={(e) => setForm({ ...form, stylist: e.target.value })}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-noir-gold/60"
              >
                <option value="">Select a stylist</option>
                {stylists.map((st) => (
                  <option key={st._id} value={st._id} className="bg-black">
                    {st.name} — {st.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Date</label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-noir-gold/60"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Time</label>
              <select 
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                disabled={!form.date || !form.stylist}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-noir-gold/60 disabled:opacity-50"
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time} className="bg-black" disabled={availableSlots.includes(time)}>
                    {time} {availableSlots.includes(time) ? '(Booked)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Full Name</label>
              <input 
                type="text" 
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Phone</label>
              <input 
                type="tel" 
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Email</label>
              <input 
                type="email" 
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Special Requests (optional)</label>
              <textarea 
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <button 
              type="submit" 
              disabled={loading}
              className="border border-noir-gold/60 px-8 py-3.5 text-xs uppercase tracking-[0.28em] text-noir-gold hover:bg-noir-gold hover:text-black transition-all duration-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Section>
    </>
  );
}
