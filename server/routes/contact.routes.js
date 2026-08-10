import { Router } from 'express';
import { body } from 'express-validator';
import * as contact from '../controllers/contact.controller.js';
import { protectAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const r = Router();

r.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('message').trim().notEmpty().isLength({ min: 5 }).withMessage('Message too short'),
  ],
  validate,
  contact.submitContact
);

r.post('/newsletter', [body('email').isEmail().withMessage('Valid email required')], validate, contact.subscribe);
r.get('/newsletter/unsubscribe', contact.unsubscribe);

// admin
r.get('/all', protectAdmin, contact.listContacts);
r.patch('/:id', protectAdmin, contact.updateContact);
r.delete('/:id', protectAdmin, contact.deleteContact);

export default r;
