import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { ordersApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const payColor = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  paid: 'bg-green-500/10 text-green-400',
  failed: 'bg-red-500/10 text-red-400',
  refunded: 'bg-purple-500/10 text-purple-400',
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await ordersApi.mine();
        setOrders(data || []);
      } catch (err) {
        setError(err.message || 'Unable to load your orders.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <>
        <PageHeader title="My Orders" subtitle="Order history" />
        <Section>
          <div className="mx-auto max-w-xl border border-white/10 p-10 text-center">
            <p className="text-noir-muted">Please log in to view your orders.</p>
            <Link to="/login" className="mt-6 inline-block text-xs uppercase tracking-wider text-noir-gold">
              Log In
            </Link>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My Orders" subtitle="Order history" />
      <Section>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-noir-gold text-sm uppercase tracking-[0.3em]">
            Loading...
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl border border-white/10 p-10 text-center">
            <p className="text-noir-muted">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mx-auto max-w-xl border border-white/10 p-10 text-center">
            <p className="font-display text-2xl text-white">No orders yet.</p>
            <Link
              to="/products"
              className="mt-6 inline-block border border-noir-gold/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-noir-gold hover:bg-noir-gold hover:text-black"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {orders.map((order) => (
              <div key={order._id} className="border border-white/10 bg-white/[0.02] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-noir-muted">#{order._id.slice(-8)}</p>
                    <p className="mt-1 text-sm text-white">
                      {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                    </p>
                    <p className="mt-1 text-xs text-noir-muted">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-noir-gold text-xl">₹{order.total.toLocaleString('en-IN')}</p>
                    <span className={`mt-2 inline-block text-xs px-2 py-1 ${payColor[order.paymentStatus] || 'bg-white/5 text-white'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-wider">
                  {order.paymentStatus === 'pending' && (
                    <Link
                      to={`/payment/${order._id}`}
                      className="border border-noir-gold/60 px-5 py-2 text-noir-gold hover:bg-noir-gold hover:text-black"
                    >
                      Pay / View QR
                    </Link>
                  )}
                  <span className="px-2 py-2 text-noir-muted">Status: {order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}