import { Router } from 'express';
import * as orders from '../controllers/order.controller.js';
import { protect, protectAdmin } from '../middleware/auth.js';

const r = Router();

// checkout (works for guests via sessionId or signed-in users)
r.post('/', orders.createOrder);

// payment / QR info + status check (scoped to user or guest session)
r.get('/payment/:id', orders.getPaymentInfo);
r.get('/payment/:id/status', orders.checkPaymentStatus);

// user's own orders
r.use('/mine', protect);
r.get('/mine', orders.myOrders);
r.get('/mine/:id', orders.getMyOrder);

// admin management
r.use('/admin', protectAdmin);
r.get('/admin', orders.getAllOrders);
r.get('/admin/:id', orders.getOrder);
r.patch('/admin/:id/status', orders.updateStatus);
r.patch('/admin/:id/payment', orders.markPaymentStatus);

export default r;
