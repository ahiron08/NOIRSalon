import Appointment from '../models/Appointment.model.js';
import Service from '../models/Service.model.js';
import Combo from '../models/Combo.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/apiFeatures.js';
import { sendEmail, layout } from '../services/email.service.js';
import { config } from '../config/index.js';

/** Aggregate price for the selected services + combos. */
async function computeTotal(serviceIds = [], comboIds = []) {
  const [services, combos] = await Promise.all([
    Service.find({ _id: { $in: serviceIds } }).select('price offerPrice name'),
    Combo.find({ _id: { $in: comboIds } }).select('offerPrice name'),
  ]);
  const serviceTotal = services.reduce((s, x) => s + (x.offerPrice || x.price), 0);
  const comboTotal = combos.reduce((s, x) => s + x.offerPrice, 0);
  const duration = services.reduce((s, x) => s + (x.duration || 0), 0) + combos.reduce((s, x) => s + (x.estimatedDuration || 0), 0);
  return { total: serviceTotal + comboTotal, duration };
}

/** Customer-facing booking — works for guests and signed-in users. */
export const createBooking = catchAsync(async (req, res, next) => {
  const { services = [], combos = [], stylist, date, time, name, phone, email, notes } = req.body;
  if (!date || !time) return next(new AppError('Please provide a date and time.', 400));
  if (!services.length && !combos.length) return next(new AppError('Select at least one service or combo.', 400));

  const { total, duration } = await computeTotal(services, combos);

  const booking = await Appointment.create({
    user: req.user?._id,
    services,
    combos,
    stylist,
    date,
    time,
    duration,
    notes,
    total,
    guestName: req.user ? undefined : name,
    guestEmail: req.user ? undefined : email,
    guestPhone: req.user ? undefined : phone,
  });

  try {
    const recipient = req.user ? req.user.email : email;
    await sendEmail({
      to: recipient,
      subject: 'Booking received — NOIR SALON',
      html: layout(
        `<p style="font-size:15px;color:#fff;">Thank you. Your appointment for <strong>${new Date(date).toLocaleDateString()} at ${time}</strong> is received and pending approval.</p>
         <p style="font-size:14px;color:#A1A1AA;">We will confirm by phone shortly.</p>`,
        'Booking received'
      ),
    });
  } catch (e) {
    console.error('[Appointments] email failed', e.message);
  }

  res.status(201).json({ success: true, data: booking });
});

/** List current user's own appointments. */
export const myAppointments = catchAsync(async (req, res) => {
  const data = await Appointment.find({ user: req.user._id }).sort('-createdAt').populate('services combos stylist', 'name price offerPrice image role');
  res.json({ success: true, count: data.length, data });
});

/** Admin: list all appointments with search/pagination/filtering. */
export const getAll = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Appointment.find().populate('user services combos stylist', 'name email phone price offerPrice name role image'),
    req.query
  ).search(['guestName', 'guestEmail', 'guestPhone']).filter().sort().paginate();
  const [data, meta] = await Promise.all([features.query, features.countTotal()]);
  res.json({ success: true, count: data.length, data, pagination: meta });
});

/** Admin: update status (pending → approved/completed/cancelled). */
export const updateStatus = catchAsync(async (req, res, next) => {
  const { status, cancelReason, adminNote } = req.body;
  const allowed = ['pending', 'approved', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return next(new AppError('Invalid status.', 400));

  const booking = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status, ...(cancelReason ? { cancelReason } : {}), ...(adminNote ? { adminNote } : {}) },
    { new: true, runValidators: true }
  ).populate('user', 'name email phone');
  if (!booking) return next(new AppError('Appointment not found.', 404));

  // notify the guest / user about the new status
  const email = booking.user?.email || booking.guestEmail;
  if (email) {
    sendEmail({
      to: email,
      subject: `Booking ${status} — NOIR SALON`,
      html: layout(
        `<p style="font-size:15px;color:#fff;">Your appointment on <strong>${new Date(booking.date).toLocaleDateString()}</strong> has been <strong>${status}</strong>.</p>`,
        `Booking ${status}`
      ),
    }).catch(() => {});
  }

  res.json({ success: true, data: booking });
});

/** Get already-booked slots for a stylist on a given date (for the picker). */
export const getSlots = catchAsync(async (req, res, next) => {
  const { date, stylist } = req.query;
  if (!date) return next(new AppError('Date is required.', 400));

  const start = new Date(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const query = { date: { $gte: start, $lt: end }, status: { $nin: ['cancelled'] } };
  if (stylist) query.stylist = stylist;

  const booked = await Appointment.find(query).select('time -_id');
  res.json({ success: true, taken: booked.map((b) => b.time) });
});
