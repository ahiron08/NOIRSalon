import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api.js';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get('/admin/dashboard')
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-noir-gold text-sm uppercase tracking-[0.3em]">Loading...</div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data?.counts?.users || 0, icon: '👤' },
    { label: 'Appointments', value: data?.counts?.appointments || 0, icon: '📅' },
    { label: 'Pending', value: data?.counts?.pendingAppointments || 0, icon: '⏳' },
    { label: "Today's", value: data?.counts?.todayAppointments || 0, icon: '🗓️' },
    { label: 'Confirmed', value: data?.counts?.confirmedAppointments || 0, icon: '✅' },
    { label: 'Completed', value: data?.counts?.completedAppointments || 0, icon: '🎉' },
    { label: 'In Progress', value: data?.counts?.inProgressAppointments || 0, icon: '✂️' },
    { label: 'Cancelled', value: data?.counts?.cancelledAppointments || 0, icon: '✖️' },
    { label: 'Orders', value: data?.counts?.orders || 0, icon: '🛒' },
    { label: 'Products', value: data?.counts?.products || 0, icon: '📦' },
    { label: 'Services', value: data?.counts?.services || 0, icon: '✂️' },
    { label: 'Blog Posts', value: data?.counts?.posts || 0, icon: '📝' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white mb-2">Dashboard</h1>
        <p className="text-sm text-noir-muted">Welcome to NOIR Admin Portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-white/10 bg-white/[0.02] p-6 hover:border-noir-gold/50 transition-colors duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-display text-white mb-1">{stat.value}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-noir-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="border border-noir-gold/30 bg-noir-gold/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-noir-gold mb-2">Total Revenue</p>
            <p className="text-4xl font-display text-white">
              ₹{data?.revenue?.toLocaleString('en-IN') || 0}
            </p>
          </div>
          <span className="text-5xl">💰</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-sm uppercase tracking-[0.2em] text-noir-gold mb-4">Recent Reservations</h3>
          <div className="space-y-3">
            {data?.recentAppointments?.length > 0 ? (
              data.recentAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-sm text-white">{apt.user?.name || apt.guestName || 'Guest'}</p>
                    <p className="text-xs text-noir-muted">
                      {apt.serviceSnapshots?.[0]?.name ||
                        apt.services?.map((s) => s.name).join(', ') ||
                        'Service'} · {new Date(apt.date).toLocaleDateString('en-IN')} {apt.time}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 ${
                      apt.status === 'confirmed' || apt.status === 'approved'
                        ? 'bg-green-500/10 text-green-400'
                        : apt.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : apt.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-noir-muted">No recent reservations</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-sm uppercase tracking-[0.2em] text-noir-gold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {data?.recentOrders?.length > 0 ? (
              data.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white">{order.user?.name || 'Guest'}</p>
                    <p className="text-xs text-noir-muted">#{order._id.slice(-8)}</p>
                  </div>
                  <span className="text-sm text-noir-gold">₹{order.total?.toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-noir-muted">No recent orders</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-noir-gold">Upcoming Reservations</h3>
          <Link to="/admin/appointments" className="text-xs uppercase tracking-wider text-noir-muted hover:text-noir-gold">
            View All →
          </Link>
        </div>
        {(data?.recentAppointments || []).filter((a) => ['pending', 'confirmed', 'approved', 'in_progress'].includes(a.status)).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Customer</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Service</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Date</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Time</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Stylist</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentAppointments
                  .filter((a) => ['pending', 'confirmed', 'approved', 'in_progress'].includes(a.status))
                  .map((apt) => (
                    <tr key={apt._id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm text-white">{apt.user?.name || apt.guestName || 'Guest'}</td>
                      <td className="px-4 py-3 text-sm text-noir-muted">
                        {apt.serviceSnapshots?.[0]?.name || apt.services?.map((s) => s.name).join(', ') || 'Service'}
                      </td>
                      <td className="px-4 py-3 text-sm text-noir-muted">{new Date(apt.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-noir-muted">{apt.time}</td>
                      <td className="px-4 py-3 text-sm text-noir-muted">{apt.stylist?.name || apt.stylistName || 'Any'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 ${
                          apt.status === 'confirmed' || apt.status === 'approved'
                            ? 'bg-green-500/10 text-green-400'
                            : apt.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-noir-muted">No upcoming reservations.</p>
        )}
      </div>
    </div>
  );
}
