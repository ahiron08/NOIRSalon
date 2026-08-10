import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  completed: 'bg-blue-500/10 text-blue-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await adminApi.get('/admin/appointments');
      if (res.success) setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminApi.patch(`/admin/appointments/${id}/status`, { status });
      loadAppointments();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-noir-gold text-sm uppercase tracking-[0.3em]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white mb-2">Appointments</h1>
        <p className="text-sm text-noir-muted">{appointments.length} total</p>
      </div>

      <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Customer</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Service</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Date</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Status</th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-noir-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {appointments.map((apt) => (
                <tr key={apt._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-white">{apt.user?.name || 'Guest'}</p>
                      <p className="text-xs text-noir-muted">{apt.user?.phone || apt.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {apt.service?.name || 'Service'}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {new Date(apt.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 ${statusColors[apt.status] || 'bg-white/5 text-white'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={apt.status}
                      onChange={(e) => updateStatus(apt._id, e.target.value)}
                      className="bg-transparent border border-white/20 px-3 py-1 text-xs text-white focus:border-noir-gold focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-noir-muted text-sm">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
