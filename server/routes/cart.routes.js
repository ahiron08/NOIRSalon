import { Router } from 'express';
import * as cart from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.js';

// Guest carts are identified by a sessionId header/body.
const r = Router();

r.get('/', cart.getCart);
r.post('/add', cart.addItem);
r.patch('/quantity', cart.updateQty);
r.delete('/item', cart.removeItem);
r.post('/coupon', cart.applyCoupon);
r.delete('/', cart.clearCart);

export default r;
