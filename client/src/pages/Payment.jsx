import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { ordersApi } from '../services/api.js';

export default function Payment() {
  const { orderId } = useParams();
  const { sessionId } = useCart();
  const [info, setInfo] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.paymentInfo(orderId, sessionId);
      setInfo(data);
      setPayment({ paymentStatus: data.paymentStatus, paid: data.paymentStatus === 'paid' });
    } catch (err) {
      setError(err.message || 'Unable to load payment details.');
    } finally {
      setLoading(false);
    }
  }, [orderId, sessionId]);

  useEffect(() => {
    if (orderId) load();
  }, [orderId, load]);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const data = await ordersApi.paymentStatus(orderId, sessionId);
      setPayment({ paymentStatus: data.paymentStatus, paid: data.paid });
      setInfo((prev) => (prev ? { ...prev, paymentStatus: data.paymentStatus, paidAt: data.paidAt } : prev));
    } catch (err) {
      setError(err.message || 'Unable to check payment status.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Payment" subtitle="Scan to pay" />
        <Section>
          <div className="flex items-center justify-center py-16 text-noir-gold text-sm uppercase tracking-[0.3em]">
            Loading...
          </div>
        </Section>
      </>
    );
  }

  if (error && !info) {
    return (
      <>
        <PageHeader title="Payment" subtitle="Scan to pay" />
        <Section>
          <div className="mx-auto max-w-xl border border-white/10 p-10 text-center">
            <p className="text-noir-muted">{error}</p>
            <Link to="/my-orders" className="mt-6 inline-block text-xs uppercase tracking-wider text-noir-gold">
              ← Back to My Orders
            </Link>
          </div>
        </Section>
      </>
    );
  }

  const isPaid = payment?.paid || info?.paymentStatus === 'paid';

  return (
    <>
      <PageHeader title="Complete Payment" subtitle="UPI QR code" />
      <Section>
        <div className="mx-auto max-w-xl border border-noir-gold/40 bg-white/[0.02] p-8">
          {isPaid ? (
            <div className="text-center">
              <h3 className="font-display text-3xl text-white">Payment Confirmed</h3>
              <p className="mt-4 text-noir-muted">
                Your order <span className="text-noir-gold">#{info?.orderId?.slice(-8)}</span> has been marked as paid.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-noir-gold">Scan to pay</p>

              {info?.qrDataUrl ? (
                // Server-generated QR — amount encoded server-side
                <img
                  src={info.qrDataUrl}
                  alt="Payment QR code"
                  className="mx-auto mt-6 h-56 w-56 border border-white/10 bg-white p-2"
                />
              ) : (
                <div className="mt-6 border border-white/10 p-6">
                  <p className="text-sm text-noir-muted">QR is not available.</p>
                  <p className="mt-2 break-all text-xs text-white">{info?.upiString}</p>
                </div>
              )}

              <div className="mt-6 grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-noir-muted">Amount</span>
                  <span className="text-noir-gold font-display text-xl">
                    ₹{(Number(info?.total) || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noir-muted">Order ID</span>
                  <span className="text-white">{info?.orderId?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noir-muted">Payment Status</span>
                  <span className="uppercase text-yellow-400">{info?.paymentStatus || 'pending'}</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-noir-muted">
                Scan the QR with any UPI app (GPay, PhonePe, Paytm) and pay the exact amount. Your order stays
                <strong className="text-yellow-400"> pending</strong> until our team verifies the payment.
              </p>

              <button
                onClick={checkStatus}
                disabled={checking}
                className="mt-6 w-full border border-noir-gold/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-noir-gold hover:bg-noir-gold hover:text-black disabled:opacity-50"
              >
                {checking ? 'Checking...' : 'Check Payment Status'}
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-white/10 pt-5">
            <Link to="/my-orders" className="text-xs uppercase tracking-wider text-noir-muted hover:text-noir-gold">
              My Orders
            </Link>
            <Link to="/" className="text-xs uppercase tracking-wider text-noir-muted hover:text-noir-gold">
              Continue Shopping
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}