import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { useCart } from '../contexts/CartContext.jsx';

function itemId(item) {
  return item.product?._id || item.product;
}
function itemName(item) {
  return item.name || item.product?.name || 'Product';
}
function itemImage(item) {
  return item.image || item.product?.image || null;
}
function itemPrice(item) {
  return Number(item.price ?? item.product?.price) || 0;
}

export default function CartPage() {
  const { cart, subtotal, total, tax, deliveryFee, count, updateQty, removeItem, applyCoupon, clear, load } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const items = cart?.items || [];

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    setBusy(true);
    setCouponMsg('');
    try {
      const cartRes = await applyCoupon(coupon.trim().toUpperCase());
      setCouponMsg(cartRes?.couponCode ? `Coupon ${cartRes.couponCode} applied.` : 'Coupon applied.');
    } catch (err) {
      setCouponMsg(err.message || 'Invalid coupon.');
    } finally {
      setBusy(false);
    }
  };

  const changeQty = (id, qty) => {
    if (qty <= 0) {
      removeItem(id).catch(() => {});
    } else {
      updateQty(id, qty).catch(() => {});
    }
  };

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your Cart" subtitle="Shopping bag" />
        <Section>
          <div className="mx-auto max-w-2xl border border-white/10 p-10 text-center">
            <p className="font-display text-2xl text-white">Your cart is empty.</p>
            <p className="mt-3 text-sm text-noir-muted">Browse our collection and add something to your bag.</p>
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
      <PageHeader title="Your Cart" subtitle={`${count} item${count === 1 ? '' : 's'}`} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const id = itemId(item);
              const img = itemImage(item);
              return (
                <div key={id} className="flex gap-5 border border-white/10 bg-white/[0.02] p-5">
                  <div className="h-28 w-24 shrink-0 bg-neutral-900 overflow-hidden">
                    {img ? (
                      <img src={img} alt={itemName(item)} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg text-white">{itemName(item)}</p>
                    <p className="mt-1 text-sm text-noir-gold">₹{itemPrice(item).toLocaleString('en-IN')}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => changeQty(id, (item.quantity || 1) - 1)}
                        className="h-8 w-8 border border-white/20 text-white hover:border-noir-gold hover:text-noir-gold"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-white">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(id, (item.quantity || 1) + 1)}
                        className="h-8 w-8 border border-white/20 text-white hover:border-noir-gold hover:text-noir-gold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(id).catch(() => {})}
                        className="ml-auto text-xs uppercase tracking-wider text-noir-muted hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-noir-gold">
                    ₹{(itemPrice(item) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => {
                  clear().then(() => load()).catch(() => {});
                }}
                className="text-xs uppercase tracking-wider text-noir-muted hover:text-red-400"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/products')}
                className="text-xs uppercase tracking-wider text-noir-gold hover:text-white"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-xs uppercase tracking-[0.25em] text-noir-gold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-noir-muted">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {Number(cart.couponDiscount) > 0 && (
                  <div className="flex justify-between text-noir-muted">
                    <span>Coupon ({cart.couponCode})</span>
                    <span className="text-green-400">−₹{Number(cart.couponDiscount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-noir-muted">
                    <span>Delivery</span>
                    <span className="text-white">₹{deliveryFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-noir-muted">
                    <span>GST (5%)</span>
                    <span className="text-white">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-3 text-lg">
                  <span className="text-white">Total</span>
                  <span className="font-display text-noir-gold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <form onSubmit={handleApplyCoupon} className="mt-5">
                <label className="mb-2 block text-xs uppercase tracking-wider text-noir-muted">Coupon code</label>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="SAVE10"
                    className="min-w-0 flex-1 border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-noir-muted focus:border-noir-gold outline-none"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="border border-noir-gold/60 px-4 text-xs uppercase tracking-wider text-noir-gold hover:bg-noir-gold hover:text-black disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && <p className="mt-2 text-xs text-noir-gold">{couponMsg}</p>}
              </form>

              <Link
                to="/checkout"
                className="mt-6 block w-full border border-noir-gold/60 px-8 py-3.5 text-center text-xs uppercase tracking-[0.3em] text-noir-gold hover:bg-noir-gold hover:text-black"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}