import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], couponCode: '', couponDiscount: 0 });
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/cart' + (localStorage.getItem('token') ? '' : `?sessionId=${sessionId}`));
      setCart(res.data);
    } catch { /* ignore */ }
  }

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
    const res = await api.delete('/cart/item' + `?sessionId=${sessionId}`); // best-effort; backend checks body
    setCart(res.data);
    return res.data;
  }

  async function applyCoupon(code) {
    const res = await api.post('/cart/coupon', { code, sessionId });
    setCart(res.data);
    return res.data;
  }

  async function clear() {
    const res = await api.delete('/cart' + `?sessionId=${sessionId}`);
    setCart(res.data);
    return res.data;
  }

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - cart.couponDiscount);
  const count = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, sessionId, addItem, updateQty, removeItem, applyCoupon, clear, subtotal, total, count, load }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
