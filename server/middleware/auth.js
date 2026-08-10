import jwt from 'jsonwebtoken';
import { promisify } from 'node:util';
import User from '../models/User.model.js';
import Admin from '../models/Admin.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { config } from '../config/index.js';

/**
 * Protects user routes — validates the Bearer token / httpOnly cookie
 * and attaches the authenticated user to `req.user`.
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return next(new AppError('You are not logged in. Please log in.', 401));

  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('The user belonging to this token no longer exists.', 401));

  req.user = user;
  next();
});

/**
 * Grant access to roles on the user model (e.g. protect + restrictedTo('admin')).
 * We treat `user.role` as a regular user by default; admins live on a
 * separate Admin model to isolate the control plane.
 */
export const restrictedTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };

/**
 * Protects admin routes using a separate JWT + Admin model.
 */
export const protectAdmin = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token) return next(new AppError('You are not logged in as admin.', 401));

  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
  const admin = await Admin.findById(decoded.id);
  if (!admin) return next(new AppError('This admin account no longer exists.', 401));

  req.admin = admin;
  next();
});
