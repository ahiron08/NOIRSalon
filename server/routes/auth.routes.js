import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

const r = Router();

const registerChain = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').optional().isMobilePhone('en-IN'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('passwordConfirm').custom((v, { req }) => v === req.body.password).withMessage('Passwords do not match'),
];

r.post('/register', authLimiter, registerChain, validate, auth.register);
r.post('/login', authLimiter, [body('email').isEmail().withMessage('Valid email required')], validate, auth.login);
r.get('/verify-email', auth.verifyEmail);
r.post('/forgot-password', authLimiter, [body('email').isEmail()], validate, auth.forgotPassword);
r.patch('/reset-password/:token', authLimiter, [body('password').isLength({ min: 8 })], validate, auth.resetPassword);
r.post('/logout', auth.logout);

r.use(protect);
r.get('/me', auth.getMe);
r.patch('/me', [body('name').optional().isLength({ min: 2 })], validate, auth.updateMe);
r.patch('/update-password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }),
  body('newPasswordConfirm').custom((v, { req }) => v === req.body.newPassword),
], validate, auth.updatePassword);

export default r;
