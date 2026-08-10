import { Router } from 'express';
import { mountCrud, mountCrudAt } from './helpers.js';
import { instagramFeed } from '../controllers/instagram.controller.js';
import { services, categories, combos, stylists, products, gallery, videos, blogs, testimonials, memberships, faqs, reviews } from '../controllers/cms.controller.js';

const r = Router();

/** Live Instagram feed (posts + reels). */
r.get('/instagram', instagramFeed);

/** Public read + admin write for each content resource. */
mountCrudAt(r, '/services', services);
mountCrudAt(r, '/combos', combos);
mountCrudAt(r, '/stylists', stylists);
mountCrudAt(r, '/gallery', gallery);
mountCrudAt(r, '/videos', videos);
mountCrudAt(r, '/testimonials', testimonials);
mountCrudAt(r, '/memberships', memberships);
mountCrudAt(r, '/faqs', faqs);
mountCrudAt(r, '/blogs', blogs);

// categories & products: read is public, writes are admin.
mountCrudAt(r, '/categories', categories, { write: false });
mountCrudAt(r, '/products', products, { write: false });

// product reviews: public create (authenticated handled by controller), admin manage.
r.get('/reviews', reviews.list);
r.get('/reviews/:id', reviews.getOne);
r.post('/reviews', reviews.create);
r.patch('/reviews/:id', reviews.update);
r.delete('/reviews/:id', reviews.remove);

export default r;
