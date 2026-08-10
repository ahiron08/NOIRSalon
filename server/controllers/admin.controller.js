import Admin from '../models/Admin.model.js';
import User from '../models/User.model.js';
import Appointment from '../models/Appointment.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Service from '../models/Service.model.js';
import Blog from '../models/Blog.model.js';
import Newsletter from '../models/Newsletter.model.js';
import Gallery from '../models/Gallery.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { signToken, cookieOptions } from '../utils/token.js';
import { createFactory } from './factory.js';

/** Admin login (separate Admin model + cookie). */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Provide email and password.', 400));

  const admin = await Admin.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).select('+password');
  if (!admin || !(await admin.correctPassword(password))) {
    return next(new AppError('Incorrect admin credentials.', 401));
  }
  if (!admin.active) return next(new AppError('This admin account is disabled.', 403));

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = signToken(admin._id);
  res.cookie('adminToken', token, cookieOptions());
  admin.password = undefined;
  res.json({ success: true, token, admin });
});

export const logout = (_req, res) => {
  res.cookie('adminToken', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};

export const getMe = catchAsync(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

export const admins = createFactory(Admin, { searchFields: ['name', 'email'] });

/** Aggregate analytics for the dashboard. */
export const dashboard = catchAsync(async (_req, res) => {
  const [
    users,
    appointments,
    pendingAppointments,
    orders,
    revenue,
    products,
    services,
    posts,
    subscribers,
    galleryCount,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Product.countDocuments({ active: true }),
    Service.countDocuments({ active: true }),
    Blog.countDocuments({ status: 'published' }),
    Newsletter.countDocuments({ subscribed: true }),
    Gallery.countDocuments({ active: true }),
  ]);

  const recentAppointments = await Appointment.find().sort('-createdAt').limit(8).populate('user', 'name email phone');
  const recentOrders = await Order.find().sort('-createdAt').limit(8).populate('user', 'name email');

  res.json({
    success: true,
    data: {
      counts: { users, appointments, pendingAppointments, orders, products, services, posts, subscribers, galleryCount },
      revenue: revenue[0]?.total || 0,
      recentAppointments,
      recentOrders,
    },
  });
});
