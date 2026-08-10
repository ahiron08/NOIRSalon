import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api.js';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  paid: 'bg-green-500/10 text-green-400',
  processing: 'bg-blue-500/10 text-blue-400',
  shipped: 'bg-purple-500/10 text-purple-400',
  delivered: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await adminApi.get('/admin/orders');
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminApi.patch(`/admin/orders/${id}/status`, { status });
      loadOrders();
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
        <h1 className="font-display text-4xl text-white mb-2">Orders</h1>
        <p className="text-sm text-noir-muted">{orders.length} total</p>
      </div>

      <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Order ID</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Customer</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Total</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Payment</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Status</th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-noir-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-mono">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-white">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-noir-muted">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-noir-gold">
                    ₹{order.total?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-xs text-noir-muted">
                    {order.paymentStatus}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 ${statusColors[order.status] || 'bg-white/5 text-white'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="bg-transparent border border-white/20 px-3 py-1 text-xs text-white focus:border-noir-gold focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-noir-muted text-sm">
                    No orders found
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
