import { useEffect, useState } from 'react';
import { adminOrdersApi } from '../../services/api.js';
import useTableControls from '../../hooks/useTableControls.js';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  processing: 'bg-blue-500/10 text-blue-400',
  shipped: 'bg-purple-500/10 text-purple-400',
  delivered: 'bg-green-500/10 text-green-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const paymentColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  paid: 'bg-green-500/10 text-green-400',
  failed: 'bg-red-500/10 text-red-400',
  refunded: 'bg-purple-500/10 text-purple-400',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'completed', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['pending', 'paid', 'failed', 'refunded'];
// Filter dropdown exposes every persisted status (including shipped/delivered).
const ORDER_STATUS_FILTER_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminOrdersApi.all();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setFeedback('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setFeedback('');
    try {
      await adminOrdersApi.updateStatus(id, status);
      await loadOrders();
      setFeedback('Order updated.');
    } catch (err) {
      console.error('Update failed:', err);
      setFeedback(err.message || 'Update failed.');
    }
  };

  const markPayment = async (id, paymentStatus) => {
    setFeedback('');
    try {
      await adminOrdersApi.markPayment(id, paymentStatus);
      await loadOrders();
      setFeedback(`Payment marked ${paymentStatus}.`);
    } catch (err) {
      console.error('Payment update failed:', err);
      setFeedback(err.message || 'Payment update failed.');
    }
  };

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
  } = useTableControls(orders, {
    searchFields: [
      (o) => o.user?.name || '',
      (o) => o.user?.email || o.guestEmail || '',
      (o) => o.guestPhone || '',
      (o) => o._id,
    ],
    filters: {
      status: (o) => o.status,
      payment: (o) => o.paymentStatus,
    },
    sortAccessors: {
      id: (o) => o._id,
      customer: (o) => o.user?.name || o.guestEmail || '',
      total: (o) => o.total || 0,
    },
  });
  const hasActiveControls =
    query.trim() !== '' || Object.keys(filterValues).some((k) => filterValues[k] && filterValues[k] !== 'all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-noir-gold text-sm uppercase tracking-[0.3em]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">Orders</h1>
          <p className="text-sm text-noir-muted">{orders.length} total{hasActiveControls ? ` · ${rows.length} shown` : ''}</p>
        </div>
        <button onClick={loadOrders} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white hover:border-noir-gold">
          Refresh
        </button>
      </div>

      {feedback && <p className="text-sm text-noir-gold">{feedback}</p>}

      {/* Search + filter toolbar */}
      <div className="flex flex-col gap-3 border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer, email, phone or order ID…"
          className="flex-1 bg-transparent border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterValues.status || 'all'}
            onChange={(e) => setFilter('status', e.target.value)}
            className="bg-neutral-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:border-noir-gold focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUS_FILTER_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-black">{s}</option>
            ))}
          </select>
          <select
            value={filterValues.payment || 'all'}
            onChange={(e) => setFilter('payment', e.target.value)}
            className="bg-neutral-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:border-noir-gold focus:outline-none"
          >
            <option value="all">All Payments</option>
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p} value={p} className="bg-black">{p}</option>
            ))}
          </select>
          {hasActiveControls && (
            <button onClick={clearAll} className="text-xs uppercase tracking-wider text-noir-muted hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr>
                <SortHeader label="Order ID" name="id" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Customer" name="customer" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Total" name="total" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Payment</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-noir-muted">Status</th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-noir-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((order) => (
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
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 ${paymentColors[order.paymentStatus] || 'bg-white/5 text-white'}`}>
                      {order.paymentStatus}
                    </span>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => markPayment(order._id, e.target.value)}
                      className="ml-2 bg-transparent border border-white/20 px-2 py-1 text-xs text-white focus:border-noir-gold focus:outline-none"
                    >
                      {PAYMENT_OPTIONS.map((p) => (
                        <option key={p} value={p} className="bg-black">{p}</option>
                      ))}
                    </select>
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
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-black">{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-noir-muted text-sm">
                    {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
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
