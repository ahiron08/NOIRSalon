import { Router } from 'express';
import { protectAdmin } from '../middleware/auth.js';

/**
 * Mounts the standard REST handlers from a factory controller onto a router,
 * protecting writes behind the admin auth middleware.
 */
export function mountCrud(router, ctrl, { write = true } = {}) {
  router.get('/', ctrl.list);
  router.get('/by-slug/:slug', ctrl.getBySlug);

  if (write) {
    router.use(protectAdmin);
    router.post('/', ctrl.create);
  }
  router.get('/:id', ctrl.getOne);
  if (write) {
    router.patch('/:id', ctrl.update);
    router.delete('/:id', ctrl.remove);
  }
  return router;
}

/**
 * Mount a CRUD sub-router under `parent` at `path`. Because
 * `parent.use(path, Router())` returns the *parent* router (not the sub-router),
 * we must build the sub-router explicitly so the resource is reachable at
 * `/path` (e.g. `/services`) rather than collapsing onto the parent root.
 */
export function mountCrudAt(parent, path, ctrl, opts = {}) {
  const sub = Router();
  parent.use(path, sub);
  return mountCrud(sub, ctrl, opts);
}

export const router = Router();
