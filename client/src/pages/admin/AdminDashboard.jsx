import { useEffect, useState } from 'react';
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
    { label: 'Orders', value: data?.counts?.orders || 0, icon: '🛒' },
    { label: 'Products', value: data?.counts?.products || 0, icon: '📦' },
    { label: 'Services', value: data?.counts?.services || 0, icon: '✂️' },
    { label: 'Blog Posts', value: data?.counts?.posts || 0, icon: '📝' },
    { label: 'Subscribers', value: data?.counts?.subscribers || 0, icon: '📧' },
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
          <h3 className="text-sm uppercase tracking-[0.2em] text-noir-gold mb-4">Recent Appointments</h3>
          <div className="space-y-3">
            {data?.recentAppointments?.length > 0 ? (
              data.recentAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white">{apt.user?.name || 'Guest'}</p>
                    <p className="text-xs text-noir-muted">{apt.service?.name || 'Service'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 ${
                    apt.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                    apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-noir-muted">No recent appointments</p>
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
    </div>
  );
}
