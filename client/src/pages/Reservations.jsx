import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import Select from '../components/Select.jsx';
import { apiFetch, reservationsApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatDateIST, formatTimeIST, todayISTString, endTimeISO } from '../utils/format.js';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  approved: 'bg-green-500/10 text-green-400',
  in_progress: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
  no_show: 'bg-gray-500/10 text-gray-400',
};

export default function Reservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [form, setForm] = useState({
    service: '',
    stylist: '',
    date: '',
    time: '',
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [myReservations, setMyReservations] = useState([]);

  const selectedService = services.find((s) => s._id === form.service);
  const selectedStylist = stylists.find((s) => s._id === form.stylist);
  const duration = selectedService?.duration || availability?.duration || 0;
  const endTime = form.date && form.time && duration ? endTimeISO(form.date, form.time, duration) : null;

  const serviceOptions = services.map((s) => ({
    value: s._id,
    label: `${s.name} — ₹${s.offerPrice || s.price}${s.duration ? ` (${s.duration} min)` : ''}`,
  }));
  const stylistOptions = stylists.map((st) => ({ value: st._id, label: `${st.name} — ${st.role}` }));

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const data = await reservationsApi.mine();
        setMyReservations(data || []);
      } catch (e) {
        console.error('Failed to load reservations', e);
      }
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const [svcData, stylistData] = await Promise.all([
          apiFetch('/content/services'),
          apiFetch('/content/stylists')
        ]);
        setServices(svcData.data || []);
        setStylists(stylistData.data || []);
      } catch (e) {
        console.error('Failed to load options', e);
      }
    })();
  }, []);

  // When arriving from a service's "Book Now" button (?service=<id>), preselect
  // that service once the service list has loaded, then clear the URL param so
  // the browser back/refresh doesn't keep re-applying it.
  useEffect(() => {
    const sp = searchParams.get('service');
    if (!sp || services.length === 0) return;
    if (!services.some((s) => s._id === sp)) return;
    setForm((f) => (f.service === sp ? f : { ...f, service: sp, time: '' }));
    setSearchParams({}, { replace: true });
  }, [searchParams, services, setSearchParams]);

  // Availability is always refetched whenever service, stylist or date changes,
  // so we never show stale slots for a previous selection.
  const loadAvailability = useCallback(async () => {
    if (!form.date || !form.stylist || !form.service) {
      setAvailableSlots([]);
      setAvailability(null);
      return;
    }
    setSlotsLoading(true);
    setSlotsError('');
    try {
      const data = await reservationsApi.availability({
        stylistId: form.stylist,
        serviceId: form.service,
        date: form.date,
      });
      setAvailability(data);
      setAvailableSlots(data.availableSlots || []);
    } catch (e) {
      setSlotsError(e.message || 'Unable to load availability.');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [form.date, form.stylist, form.service]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const clearTime = () => setForm((f) => ({ ...f, time: '' }));

  // Text/date inputs (event-based). The date change must also clear the time.
  const onChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) =>
      field === 'date' ? { ...f, date: value, time: '' } : { ...f, [field]: value }
    );
  };

  // Custom dropdowns (value-based). Changing service / stylist / date clears time.
  const onSelectChange = (field) => (value) => {
    setForm((f) =>
      field === 'time' ? { ...f, time: value } : { ...f, [field]: value, time: '' }
    );
  };

    const submit = async (e) => {
    e.preventDefault();
    if (!form.time) {
      setBookingError('Please select an available time slot.');
      return;
    }
    setLoading(true);
    setBookingError('');
    try {
      const res = await reservationsApi.book({
        ...form,
        services: form.service ? [form.service] : [],
        combos: []
      });
      setLastBooking(res.data);
      setSubmitted(true);
      if (user) {
        try {
          const data = await reservationsApi.mine();
          setMyReservations(data || []);
        } catch (err) { /* ignore */ }
      }
    } catch (err) {
      console.error('Booking failed', err);
      if (err && err.status === 409) {
        // The slot was taken between our availability check and submit — refresh.
        setBookingError('That time slot was just booked. Please choose another time.');
        setForm((f) => ({ ...f, time: '' }));
        loadAvailability();
      } else {
        setBookingError(err?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Once a booking is made, show the confirmation briefly, then return to the
  // salon homepage as requested.
  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => navigate('/home', { replace: true }), 2200);
    return () => clearTimeout(t);
  }, [submitted, navigate]);

  const cancelBooking = async (id) => {
    try {
      await reservationsApi.cancel(id);
      const data = await reservationsApi.mine();
      setMyReservations(data || []);
    } catch (err) {
      setBookingError(err.message || 'Unable to cancel reservation.');
    }
  };

  const canFetchSlots = Boolean(form.service && form.stylist && form.date);
  const noSlots = canFetchSlots && !slotsLoading && !slotsError && availableSlots.length === 0;
  const timeOptions = availableSlots.map((t) => ({ value: t, label: t }));
  const timePlaceholder = !canFetchSlots
    ? 'Select service, stylist & date first'
    : slotsLoading
      ? 'Loading available times…'
      : availableSlots.length === 0
        ? 'No available times'
        : 'Select an available time';

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
            <h3 className="font-display text-3xl text-white">Booking Received</h3>
            <p className="mt-4 text-noir-muted">
              Thank you, {form.name}. Your appointment for{' '}
              <strong className="text-white">{selectedService?.name}</strong> on{' '}
              <strong className="text-white">{form.date ? formatDateIST(`${form.date}T00:00:00+05:30`) : ''}</strong>
              {form.time ? (
                <>
                  {' '}at <strong className="text-white">{form.time}</strong>
                  {duration ? ` — ${duration} min` : ''}
                </>
              ) : null}
              {' '}has been received.
            </p>
            <div className="mt-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1.5 text-xs uppercase tracking-wider text-yellow-400">
                <span className="h-2 w-2 rounded-full bg-yellow-400" /> Status: Pending
              </span>
            </div>
            <p className="mt-4 text-sm text-noir-muted">We will confirm your booking shortly via phone or email.</p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm((f) => ({ ...f, date: '', time: '' }));
              }}
              className="mt-6 border border-white/20 px-6 py-2 text-xs uppercase tracking-wider text-white hover:border-noir-gold hover:text-noir-gold"
            >
              Book Another
            </button>
          </motion.div>

          {user && myReservations.length > 0 && (
            <div className="mx-auto mt-10 max-w-2xl">
              <h3 className="text-xs uppercase tracking-[0.25em] text-noir-gold mb-4">My Reservations</h3>
              <div className="space-y-3">
                {myReservations.map((a) => (
                  <div key={a._id} className="border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white">
                          {(a.serviceSnapshots?.map((s) => s.name).join(', ')) ||
                            a.services?.map((s) => s.name).join(', ') ||
                            'Service'}
                        </p>
                        <p className="text-xs text-noir-muted">
                          {a.date ? formatDateIST(a.date) : ''} at {a.time}
                          {a.duration ? ` · ${a.duration} min` : ''}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 ${statusColors[a.status] || 'bg-white/5 text-white'}`}>
                        {a.status}
                      </span>
                    </div>
                    {['pending', 'confirmed'].includes(a.status) && (
                      <button
                        onClick={() => cancelBooking(a._id)}
                        className="mt-3 text-xs uppercase tracking-wider text-noir-muted hover:text-red-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
              <Select
                value={form.service}
                onChange={onSelectChange('service')}
                options={serviceOptions}
                placeholder="Select a service"
              />
              {selectedService?.duration ? (
                <p className="mt-2 text-xs text-noir-gold">Duration: {selectedService.duration} minutes</p>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Stylist</label>
              <Select
                value={form.stylist}
                onChange={onSelectChange('stylist')}
                options={stylistOptions}
                placeholder="Select a stylist"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Date</label>
              <input
                type="date"
                required
                min={todayISTString()}
                value={form.date}
                onChange={onChange('date')}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-noir-gold/60"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Time</label>
              <Select
                value={form.time}
                onChange={onSelectChange('time')}
                options={timeOptions}
                placeholder={timePlaceholder}
                disabled={!canFetchSlots || slotsLoading || availableSlots.length === 0}
              />
              {canFetchSlots && !slotsLoading && slotsError && (
                <p className="mt-2 text-xs text-red-400">{slotsError}</p>
              )}
              {noSlots && (
                <p className="mt-2 text-xs text-red-400">
                  No available times for {selectedService?.name} ({duration || '?'} min) with{' '}
                  {selectedStylist?.name} on {form.date ? formatDateIST(`${form.date}T00:00:00+05:30`) : ''}.
                </p>
              )}
            </div>
          </div>

          {/* Appointment summary */}
          {form.service && form.stylist && form.date && form.time ? (
            <div className="border border-noir-gold/30 bg-white/[0.02] p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-noir-gold mb-2">Appointment Summary</p>
              <p className="text-white">
                <strong>{selectedService?.name}</strong> · {selectedStylist?.name}
              </p>
              <p className="text-noir-muted">
                {form.date ? formatDateIST(`${form.date}T00:00:00+05:30`) : ''}
                {' '}· {form.time}
                {duration ? ` – ${formatTimeIST(endTime)}` : ''}
                {duration ? ` · Duration ${duration} min` : ''}
              </p>
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={onChange('name')}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Phone</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={onChange('phone')}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={onChange('email')}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-noir-muted">Special Requests (optional)</label>
              <textarea
                value={form.notes}
                onChange={onChange('notes')}
                rows={4}
                className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted outline-none focus:border-noir-gold/60"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            {bookingError && <p className="mb-3 text-sm text-red-400">{bookingError}</p>}
            <button
              type="submit"
              disabled={loading || !form.time}
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


