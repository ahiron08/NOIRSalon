import { useEffect, useState } from 'react';
import { adminReservationsApi, adminApi } from '../../services/api.js';
import Select from '../../components/Select.jsx';
import useTableControls from '../../hooks/useTableControls.js';
import { formatDateIST, formatTimeIST, SALON_TIMEZONE } from '../../utils/format.js';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  approved: 'bg-green-500/10 text-green-400',
  in_progress: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
  no_show: 'bg-gray-500/10 text-gray-400',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
// Filter dropdown includes the legacy 'approved' alias so it can select those rows too.
const STATUS_FILTER_OPTIONS = ['pending', 'approved', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

/** Calendar-day key (YYYY-MM-DD) for a Date in salon-local time. */
function toDateKey(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Sortable column header with an indicator arrow. */
function SortHeader({ label, name, activeKey, dir, onSort, align = 'left' }) {
  const active = activeKey === name;
  return (
    <th className={`px-6 py-4 text-xs uppercase tracking-[0.2em] ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => onSort(name)}
        className={`inline-flex items-center gap-1.5 transition-colors ${active ? 'text-noir-gold' : 'text-noir-muted hover:text-noir-gold'}`}
      >
        {label}
        <span className="text-[0.7em]">{active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  );
}

/** Start–end display, using startTime/endTime when present, else time + duration. */
function apptTimeRange(apt) {
  const toMin = (t) => {
    const m = /^(\d{2}):(\d{2})$/.exec(t || '');
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  if (apt.startTime && apt.endTime) {
    return `${formatTimeIST(apt.startTime)} – ${formatTimeIST(apt.endTime)}`;
  }
  const startMin = toMin(apt.time);
  if (startMin === null || !apt.duration) return apt.time || '';
  const endMin = startMin + apt.duration;
  const pad = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  return `${apt.time} – ${pad(endMin)}`;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ service: '', stylist: '', date: '', time: '', appointmentId: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);

  useEffect(() => {
    loadAppointments();
    loadOptions();
  }, []);

  const showFeedback = (msg, type = 'success') => {
    setFeedback(msg);
    setFeedbackType(type);
    window.setTimeout(() => setFeedback(''), 8000);
  };

  const loadOptions = async () => {
    try {
      const [svc, sty] = await Promise.all([
        adminApi.get('/admin/services'),
        adminApi.get('/admin/stylists'),
      ]);
      setServices(svc.data || []);
      setStylists(sty.data || []);
    } catch (err) {
      console.error('Failed to load services/stylists', err);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await adminReservationsApi.all();
      setAppointments(data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      showFeedback('Failed to load reservations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshSelected = async (id) => {
    try {
      const data = await adminReservationsApi.getOne(id);
      setSelected(data);
      return data;
    } catch (err) {
      return null;
    }
  };

  const updateStatus = async (id, status, extra = {}) => {
    try {
      await adminReservationsApi.updateStatus(id, status, extra);
      if (selected?._id === id) await refreshSelected(id);
      await loadAppointments();
      showFeedback(status === 'confirmed' ? 'Appointment confirmed.' : 'Reservation updated.');
    } catch (err) {
      console.error('Update failed:', err);
      // 409 means the confirmation/change conflicted — show the server's reason.
      showFeedback(err.message || 'Update failed.', 'error');
    }
  };

  const openDetail = async (id) => {
    const data = await adminReservationsApi.getOne(id);
    setSelected(data);
  };

  const openEdit = (apt) => {
    setEditForm({
      service: apt.services?.[0]?._id || apt.services?.[0] || apt.serviceSnapshots?.[0]?.service || '',
      stylist: apt.stylist?._id || apt.stylist || '',
      date: apt.startTime ? formatDateIST(apt.startTime) : '',
      time: apt.time || '',
      appointmentId: apt._id,
    });
    setEditError('');
    setEditOpen(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    try {
      const payload = {
        services: editForm.service ? [editForm.service] : undefined,
        stylist: editForm.stylist || undefined,
        date: editForm.date || undefined,
        time: editForm.time || undefined,
      };
      await adminReservationsApi.update(editForm.appointmentId, payload);
      setEditOpen(false);
      if (selected?._id === editForm.appointmentId) await refreshSelected(editForm.appointmentId);
      await loadAppointments();
      showFeedback('Appointment updated.');
    } catch (err) {
      console.error('Edit failed:', err);
      setEditError(err.message || 'Could not update appointment.');
    } finally {
      setEditSaving(false);
    }
  };

  const openStatus = (apt) => statusColors[apt.status] || 'bg-white/5 text-white';
  const aptServiceNames = (apt) =>
    (apt.serviceSnapshots?.length
      ? apt.serviceSnapshots.map((s) => s.name)
      : (apt.services || []).map((s) => s.name || s)
    ).filter(Boolean).join(', ') || 'Service';
  const editServiceOptions = services.map((s) => ({
    value: s._id,
    label: `${s.name}${s.duration ? ` (${s.duration} min)` : ''}`,
  }));
  const editStylistOptions = stylists.map((st) => ({ value: st._id, label: st.name }));

  const {
    rows,
    query,
    setQuery,
    filterValues,
    setFilter,
    clearAll,
    sortKey,
    sortDir,
    toggleSort,
  } = useTableControls(appointments, {
    searchFields: [
      (a) => a.user?.name || a.guestName || '',
      (a) => a.user?.phone || a.user?.email || a.guestPhone || a.guestEmail || '',
      (a) => (a.serviceSnapshots || []).map((s) => s.name).join(' '),
    ],
    filters: {
      status: (a) => a.status,
      stylist: (a) => a.stylist?.name || a.stylistName || 'Any',
      date: (a) => toDateKey(a.startTime || a.date),
    },
    sortAccessors: {
      customer: (a) => a.user?.name || a.guestName || '',
      date: (a) => new Date(a.startTime || a.date).getTime(),
      status: (a) => a.status,
    },
  });

  const stylistOptions = [...new Set(appointments.map((a) => a.stylist?.name || a.stylistName || 'Any'))].filter(Boolean).sort();
  const dateOptions = [...new Set(appointments.map((a) => toDateKey(a.startTime || a.date)))].filter(Boolean).sort();
  const hasActiveControls =
    query.trim() !== '' || Object.keys(filterValues).some((k) => filterValues[k] && filterValues[k] !== 'all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">Appointments</h1>
          <p className="text-sm text-noir-muted">{appointments.length} total{hasActiveControls ? ` · ${rows.length} shown` : ''}</p>
        </div>
        <button onClick={loadAppointments} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white hover:border-noir-gold">
          Refresh
        </button>
      </div>

      {feedback && (
        <p className={`text-sm ${feedbackType === 'error' ? 'text-red-400' : 'text-noir-gold'}`}>{feedback}</p>
      )}

      {/* Search + filter toolbar */}
      <div className="flex flex-col gap-3 border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer, phone or service…"
          className="flex-1 bg-transparent border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterValues.status || 'all'}
            onChange={(e) => setFilter('status', e.target.value)}
            className="bg-neutral-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:border-noir-gold focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_FILTER_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-black">{s}</option>
            ))}
          </select>
          <select
            value={filterValues.stylist || 'all'}
            onChange={(e) => setFilter('stylist', e.target.value)}
            className="bg-neutral-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:border-noir-gold focus:outline-none"
          >
            <option value="all">All Stylists</option>
            {stylistOptions.map((s) => (
              <option key={s} value={s} className="bg-black">{s}</option>
            ))}
          </select>
          <select
            value={filterValues.date || 'all'}
            onChange={(e) => setFilter('date', e.target.value)}
            className="bg-neutral-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:border-noir-gold focus:outline-none"
          >
            <option value="all">All Dates</option>
            {dateOptions.map((d) => (
              <option key={d} value={d} className="bg-black">{formatDateIST(d)}</option>
            ))}
          </select>
          {hasActiveControls && (
            <button
              onClick={clearAll}
              className="text-xs uppercase tracking-wider text-noir-muted hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {selected && (
        <div className="border border-noir-gold/40 bg-white/[0.02] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-display text-lg text-white">{selected.user?.name || selected.guestName || 'Guest'}</p>
              <p className="text-sm text-noir-muted">
                {aptServiceNames(selected)} · {selected.date ? formatDateIST(selected.date) : ''} at {apptTimeRange(selected)}
              </p>
              {selected.duration ? <p className="text-sm text-noir-muted">Duration: {selected.duration} minutes</p> : null}
              <p className="text-sm text-noir-muted">Stylist: {selected.stylist?.name || selected.stylistName || 'Any'}</p>
              {selected.notes && <p className="text-sm text-noir-muted">Notes: {selected.notes}</p>}
              {selected.total > 0 && <p className="text-sm text-noir-gold">₹{selected.total.toLocaleString('en-IN')}</p>}
            </div>
            <span className={`text-xs px-2 py-1 ${openStatus(selected)}`}>{selected.status}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => updateStatus(selected._id, 'confirmed')} className="border border-green-500/50 px-5 py-2 text-xs uppercase tracking-wider text-green-400 hover:bg-green-500 hover:text-black">
              Confirm
            </button>
            <button onClick={() => updateStatus(selected._id, 'in_progress')} className="border border-blue-500/50 px-5 py-2 text-xs uppercase tracking-wider text-blue-400 hover:bg-blue-500 hover:text-black">
              Mark In Progress
            </button>
            {selected.status !== 'completed' && selected.status !== 'cancelled' && selected.status !== 'no_show' && (
              <button onClick={() => updateStatus(selected._id, 'completed')} className="border border-noir-gold/60 px-5 py-2 text-xs uppercase tracking-wider text-noir-gold hover:bg-noir-gold hover:text-black">
                Complete Reservation
              </button>
            )}
            {selected.status !== 'cancelled' && (
              <button onClick={() => updateStatus(selected._id, 'cancelled')} className="border border-red-500/40 px-5 py-2 text-xs uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-black">
                Cancel
              </button>
            )}
            <button onClick={() => openEdit(selected)} className="border border-white/20 px-5 py-2 text-xs uppercase tracking-wider text-white hover:border-white">
              Edit
            </button>
            {selected.status === 'confirmed' && (
              <button onClick={() => updateStatus(selected._id, 'no_show')} className="border border-white/20 px-5 py-2 text-xs uppercase tracking-wider text-noir-muted hover:border-white">
                Mark No-Show
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-noir-gold text-sm uppercase tracking-[0.3em]">Loading...</div>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <SortHeader label="Customer" name="customer" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Service</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Stylist</th>
                  <SortHeader label="Date" name="date" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Time</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Duration</th>
                  <SortHeader label="Status" name="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-noir-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((apt) => (
                  <tr key={apt._id} onClick={() => openDetail(apt._id)} className="hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white">{apt.user?.name || apt.guestName || 'Guest'}</p>
                        <p className="text-xs text-noir-muted">{apt.user?.phone || apt.user?.email || apt.guestPhone || apt.guestEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{aptServiceNames(apt)}</td>
                    <td className="px-6 py-4 text-sm text-white">{apt.stylist?.name || apt.stylistName || 'Any'}</td>
                    <td className="px-6 py-4 text-sm text-white">{apt.date ? formatDateIST(apt.date) : ''}</td>
                    <td className="px-6 py-4 text-sm text-noir-muted">{apptTimeRange(apt)}</td>
                    <td className="px-6 py-4 text-sm text-noir-muted">{apt.duration ? `${apt.duration} min` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 ${openStatus(apt)}`}>{apt.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={apt.status === 'approved' ? 'confirmed' : apt.status}
                        onChange={(e) => updateStatus(apt._id, e.target.value)}
                        className="bg-transparent border border-white/20 px-3 py-1 text-xs text-white focus:border-noir-gold focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-black">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-noir-muted text-sm">
                      {appointments.length === 0 ? 'No appointments found' : 'No appointments match your filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md border border-white/10 bg-neutral-900 p-8">
            <h3 className="font-display text-xl text-white mb-4">Edit Appointment</h3>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-noir-muted">Service</label>
                <Select
                  value={editForm.service}
                  onChange={(val) => setEditForm((f) => ({ ...f, service: val }))}
                  options={editServiceOptions}
                  placeholder="Select service"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-noir-muted">Stylist</label>
                <Select
                  value={editForm.stylist}
                  onChange={(val) => setEditForm((f) => ({ ...f, stylist: val }))}
                  options={editStylistOptions}
                  placeholder="Any stylist"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-noir-muted">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-transparent border border-white/20 px-3 py-2 text-sm text-white focus:border-noir-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-noir-muted">Start time</label>
                  <input
                    type="time"
                    step="1800"
                    value={editForm.time}
                    onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full bg-transparent border border-white/20 px-3 py-2 text-sm text-white focus:border-noir-gold focus:outline-none"
                  />
                </div>
              </div>
              {editError && <p className="text-sm text-red-400">{editError}</p>}
              <div className="flex items-center gap-4 pt-2">
                <button type="submit" disabled={editSaving} className="flex-1 border border-noir-gold px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black transition-colors disabled:opacity-50">
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditOpen(false)} className="px-6 py-2.5 text-xs uppercase tracking-wider text-white/70 hover:text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

