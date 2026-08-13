import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ordersApi } from '../services/api.js';

export default function Checkout() {
  const { cart, subtotal, total, tax, deliveryFee, count, sessionId, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    name: user?.name || '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const items = cart?.items || [];

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await ordersApi.create({
        paymentMethod: 'upi',
        sessionId,
        email: form.email,
        phone: form.phone,
        address: {
          line1: form.line1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          phone: form.phone,
        },
      });
      const order = res?.data;
      if (!order?._id) throw new Error('Order was not created.');
      // The server already emptied the cart; clear the in-memory copy too so the
      // navbar badge resets and a second checkout doesn't show stale items.
      clear().catch(() => {});
      // The payment QR is produced server-side from the authoritative total.
      navigate(`/payment/${order._id}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <>
        <PageHeader title="Checkout" subtitle="Secure payment" />
        <Section>
          <div className="mx-auto max-w-xl border border-white/10 p-10 text-center">
            <p className="font-display text-2xl text-white">Your cart is empty.</p>
            <Link
              to="/products"
              className="mt-6 inline-block border border-noir-gold/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-noir-gold hover:bg-noir-gold hover:text-black"
            >
              Shop Products
            </Link>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Checkout" subtitle={`${count} item${count === 1 ? '' : 's'}`} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Form */}
          <form onSubmit={submit} className="lg:col-span-2 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-wider text-noir-muted">Contact Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-wider text-noir-muted">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-noir-muted">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-noir-muted">Address</label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={update('line1')}
                  placeholder="Line 1"
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-noir-muted">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={update('city')}
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-noir-muted">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={update('state')}
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold outline-none"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="border border-noir-gold/60 px-8 py-3.5 text-xs uppercase tracking-[0.3em] text-noir-gold hover:bg-noir-gold hover:text-black disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order & Pay via QR'}
            </button>
            <p className="text-xs text-noir-muted">Payments are verified by our team after you scan the QR.</p>
          </form>
          {/* Summary */}
          <div className="border border-white/10 bg-white/[0.02] p-6 h-max">
            <h3 className="text-xs uppercase tracking-[0.25em] text-noir-gold mb-4">Order Summary</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product?._id || item.product} className="flex justify-between text-sm">
                  <span className="text-noir-muted">{item.name || item.product?.name} × {item.quantity}</span>
                  <span className="text-white">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-3 text-sm text-noir-muted">
                <span>Subtotal</span>
                <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {Number(cart.couponDiscount) > 0 && (
                <div className="flex justify-between text-sm text-noir-muted">
                  <span>Coupon ({cart.couponCode})</span>
                  <span className="text-green-400">−₹{Number(cart.couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-noir-muted">
                  <span>Delivery</span>
                  <span className="text-white">₹{deliveryFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm text-noir-muted">
                  <span>GST (5%)</span>
                  <span className="text-white">₹{tax.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-xl">
                <span className="text-white">Total</span>
                <span className="font-display text-noir-gold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}