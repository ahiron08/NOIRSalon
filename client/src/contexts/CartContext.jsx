import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

const CartContext = createContext(null);

const SESSION_KEY = 'noirCartSession';

function newSessionId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], couponCode: '', couponDiscount: 0 });
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem(SESSION_KEY);
    const id = existing || newSessionId();
    if (!existing) localStorage.setItem(SESSION_KEY, id);
    return id;
  });

  const load = useCallback(async () => {
    try {
      const suffix = localStorage.getItem('token') ? '' : `?sessionId=${sessionId}`;
      const res = await api.get('/cart' + suffix);
      setCart(res.data);
    } catch { /* ignore */ }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addItem(productId, qty = 1) {
    const res = await api.post('/cart/add', { productId, quantity: qty, sessionId });
    setCart(res.data);
    return res.data;
  }

  async function updateQty(productId, qty) {
    const res = await api.patch('/cart/quantity', { productId, quantity: qty, sessionId });
    setCart(res.data);
    return res.data;
  }

  async function removeItem(productId) {
    const res = await api.delete('/cart/item', { data: { productId, sessionId } });
    setCart(res.data);
    return res.data;
  }

  async function applyCoupon(code) {
    const res = await api.post('/cart/coupon', { code, sessionId });
    setCart(res.data);
    return res.data;
  }

  async function clear() {
    const res = await api.delete('/cart' + (localStorage.getItem('token') ? '' : `?sessionId=${sessionId}`));
    setCart(res.data);
    return res.data;
  }

  // Totals are derived from the server-snapshotted prices on each cart item.
  // The authoritative final total is always recomputed by the backend at order
  // creation using current Mongo prices. To keep what the customer sees in the
  // cart/checkout in sync with what the backend actually charges, we mirror the
  // backend's pricing formula here (5% GST + ₹99 delivery fee).
  const DELIVERY_FEE = 99;
  const TAX_RATE = 0.05;
  const subtotal = (cart.items || []).reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
  const couponDiscount = Number(cart.couponDiscount) || 0;
  const taxable = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(taxable * TAX_RATE);
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = Math.max(0, taxable + tax + deliveryFee);
  const count = (cart.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  const value = {
    cart, sessionId, addItem, updateQty, removeItem, applyCoupon, clear, load,
    subtotal, total, tax, deliveryFee, count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
