import { Router } from 'express';
import authRouter from './auth.routes.js';
import contentRouter from './content.routes.js';
import appointmentRouter from './appointment.routes.js';
import cartRouter from './cart.routes.js';
import orderRouter from './order.routes.js';
import contactRouter from './contact.routes.js';
import adminRouter from './admin.routes.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { rootSanitizer, stringSanitizer } from '../middleware/sanitize.js';

const api = Router();

// global hygiene + rate limiting
api.use(apiLimiter);
api.use(rootSanitizer);
api.use(stringSanitizer);

api.get('/health', (_req, res) =>
  res.json({ success: true, service: 'NOIR SALON API', time: new Date().toISOString() })
);

api.use('/auth', authRouter);
api.use('/appointments', appointmentRouter);
api.use('/cart', cartRouter);
api.use('/orders', orderRouter);
api.use('/contact', contactRouter);
api.use('/admin', adminRouter);

// public content (services, combos, gallery, etc.) last, as it traps `/`
api.use('/content', contentRouter);

export default api;
