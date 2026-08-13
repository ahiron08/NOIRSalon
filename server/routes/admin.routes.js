import { Router } from 'express';
import { mountCrud, mountCrudAt } from './helpers.js';
import * as adminAuth from '../controllers/admin.controller.js';
import { protectAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { services, categories, combos, stylists, products, gallery, videos, blogs, testimonials, memberships, faqs, coupons, giftCards } from '../controllers/cms.controller.js';
import * as appts from '../controllers/appointment.controller.js';
import * as orders from '../controllers/order.controller.js';
import * as contact from '../controllers/contact.controller.js';
import { uploadMedia } from '../services/media.service.js';

const r = Router();

// ---- auth ----
r.post('/login', adminAuth.login);
r.post('/logout', adminAuth.logout);

r.use(protectAdmin);
r.get('/me', adminAuth.getMe);
r.get('/dashboard', adminAuth.dashboard);

// ---- admins ----
mountCrudAt(r, '/admins', adminAuth.admins);

// ---- CMS CRUD (all writes & reads under admin protection) ----
mountCrudAt(r, '/services', services);
mountCrudAt(r, '/categories', categories);
mountCrudAt(r, '/combos', combos);
mountCrudAt(r, '/stylists', stylists);
mountCrudAt(r, '/products', products);
mountCrudAt(r, '/gallery', gallery);
mountCrudAt(r, '/videos', videos);
mountCrudAt(r, '/blogs', blogs);
mountCrudAt(r, '/testimonials', testimonials);
mountCrudAt(r, '/memberships', memberships);
mountCrudAt(r, '/faqs', faqs);
mountCrudAt(r, '/coupons', coupons);
mountCrudAt(r, '/giftcards', giftCards);

// ---- ops management ----
r.get('/appointments', appts.getAll);
r.get('/appointments/:id', appts.getOne);
r.patch('/appointments/:id/status', appts.updateStatus);
r.get('/orders', orders.getAllOrders);
r.get('/orders/:id', orders.getOrder);
r.patch('/orders/:id/status', orders.updateStatus);
r.patch('/orders/:id/payment', orders.markPaymentStatus);
r.get('/contacts', contact.listContacts);
r.patch('/contacts/:id', contact.updateContact);
r.delete('/contacts/:id', contact.deleteContact);

// ---- media upload ----
r.post('/upload', upload.any(), async (req, res, next) => {
  try {
    const { fieldname, buffer, originalname, mimetype } = req.files[0];
    const type = mimetype.startsWith('video') ? 'video' : 'image';
    const result = await uploadMedia({ buffer, originalname }, { folder: `noir/${type}`, resourceType: type });
    res.json({ success: true, url: result.url, public_id: result.public_id, fieldname });
  } catch (err) {
    next(err);
  }
});

export default r;
