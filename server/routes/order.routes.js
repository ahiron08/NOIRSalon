import { Router } from 'express';
import * as orders from '../controllers/order.controller.js';
import { protect, protectAdmin } from '../middleware/auth.js';

const r = Router();

// checkout (works for guests via sessionId or signed-in users)
r.post('/', orders.createOrder);

r.use('/mine', protect);
r.get('/mine', orders.myOrders);

// admin management
r.get('/', protectAdmin, orders.getAllOrders);
r.get('/:id', protectAdmin, orders.getOrder);
r.patch('/:id/status', protectAdmin, orders.updateStatus);

export default r;
