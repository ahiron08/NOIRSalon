import mongoose from 'mongoose';
import Appointment from '../models/Appointment.model.js';
import Service from '../models/Service.model.js';
import Combo from '../models/Combo.model.js';
import Stylist from '../models/Stylist.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/apiFeatures.js';
import {
  sendAppointmentCreatedEmail,
  sendAppointmentConfirmedEmail,
  sendAppointmentCancelledEmail,
  sendAppointmentCompletedEmail,
} from '../services/email.service.js';
import { config } from '../config/index.js';
import {
  BLOCKING_STATUSES,
  workingMinutes,
  getOccupiedIntervals,
  generateAvailableSlots,
  reserveSlot,
  releaseSlot,
  findConflictingAppointment,
  loadAvailabilityParams,
  dayStartIST,
  dateTimeIST,
  formatDateIST,
  formatTimeIST,
  minutesOfDayIST,
  todayISTString,
} from '../services/availability.service.js';

/** Aggregate price for the selected services + combos (server-authoritative). */
async function computeTotal(serviceIds = [], comboIds = []) {
  const [services, combos] = await Promise.all([
    Service.find({ _id: { $in: serviceIds } }).select('price offerPrice name duration image'),
    Combo.find({ _id: { $in: comboIds } }).select('offerPrice name estimatedDuration'),
  ]);
  const serviceTotal = services.reduce((s, x) => s + (x.offerPrice || x.price), 0);
  const comboTotal = combos.reduce((s, x) => s + x.offerPrice, 0);
  const duration =
    services.reduce((s, x) => s + (x.duration || 0), 0) +
    combos.reduce((s, x) => s + (x.estimatedDuration || 0), 0);
  return { total: serviceTotal + comboTotal, duration, services, combos };
}

/**
 * Validate a requested appointment window against salon hours + the past, and
 * return the absolute startTime / endTime (Asia/Kolkata) or throw an AppError.
 */
function buildAppointmentWindow({ date, time, duration, requireFuture = true }) {
  const dayStart = dayStartIST(date);
  if (!dayStart) throw new AppError('Invalid date.', 400);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new AppError('Invalid time format.', 400);

  const startTime = dateTimeIST(date, time);
  if (!startTime) throw new AppError('Invalid date or time.', 400);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  // Salon-local "today" comparisons
  const now = new Date();
  if (requireFuture && dayStart < dayStartIST(todayISTString())) {
    throw new AppError('Please choose a future date.', 400);
  }
  if (requireFuture && formatDateIST(now) === date && minutesOfDayIST(startTime) <= minutesOfDayIST(now)) {
    throw new AppError('That time is in the past. Please choose a later time.', 400);
  }

  const { openMin, closeMin } = workingMinutes();
  const startMin = minutesOfDayIST(startTime);
  const endMin = minutesOfDayIST(endTime);
  if (startMin < openMin || startMin >= closeMin || endMin > closeMin) {
    throw new AppError(
      `Appointments must be within salon hours (${config.salon.openTime}–${config.salon.closeTime}) and finish before closing.`,
      400
    );
  }
  return { dayStart, startTime, endTime };
}

/** Customer-facing booking — works for guests and signed-in users. */
export const createBooking = catchAsync(async (req, res, next) => {
  const { services = [], combos = [], stylist, date, time, name, phone, email, notes } = req.body;
  if (!date || !time) return next(new AppError('Please provide a date and time.', 400));
  if (!services.length && !combos.length) return next(new AppError('Select at least one service or combo.', 400));

  for (const id of services) {
    if (!mongoose.isValidObjectId(id)) return next(new AppError('Invalid service selected.', 400));
  }
  for (const id of combos) {
    if (!mongoose.isValidObjectId(id)) return next(new AppError('Invalid combo selected.', 400));
  }
  if (stylist && !mongoose.isValidObjectId(stylist)) return next(new AppError('Invalid stylist selected.', 400));

  // Prices + duration always recomputed from MongoDB — never trusted from the client.
  const { total, duration, services: foundServices, combos: foundCombos } = await computeTotal(services, combos);
  if (foundServices.length !== services.length || foundCombos.length !== combos.length) {
    return next(new AppError('One or more selected services could not be found.', 404));
  }
  if (foundServices.some((s) => !s.duration) || duration <= 0) {
    return next(new AppError('The selected service has no duration configured. Please contact us.', 400));
  }

  let stylistName;
  if (stylist) {
    const found = await Stylist.findById(stylist);
    if (!found) return next(new AppError('Selected stylist not found.', 400));
    if (!found.active || !found.bookable) return next(new AppError('This stylist is currently unavailable.', 400));
    stylistName = found.name;
  }

  let window;
  try {
    window = buildAppointmentWindow({ date, time, duration });
  } catch (e) {
    return next(e);
  }
  const { dayStart, startTime, endTime } = window;

  // Create the appointment as a PENDING HOLD, then atomically reserve its slot.
  // If the atomic gate rejects the interval, the appointment is rolled back and
  // the client gets a 409 instead of trusting the earlier availability response.
  const booking = await Appointment.create({
    user: req.user?._id,
    services,
    combos,
    stylist,
    stylistName,
    serviceSnapshots: foundServices.map((sv) => ({
      service: sv._id,
      name: sv.name,
      price: sv.offerPrice || sv.price,
      duration: sv.duration,
      image: sv.image,
    })),
    date: dayStart,
    time,
    startTime,
    endTime,
    duration,
    notes,
    total,
    guestName: name,
    guestEmail: email,
    guestPhone: phone,
    status: 'pending',
  });

  const reserved = await reserveSlot({
    appointmentId: booking._id,
    stylistId: stylist || null,
    startTime,
    endTime,
    dayStart,
  });
  if (!reserved) {
    await booking.deleteOne();
    return next(new AppError('That time slot was just booked. Please choose another time.', 409));
  }

  // Send "Reservation Received" to the persisted customer email. Fire-and-forget:
  // a delivery failure is logged by the email service and never affects the
  // booking that has already been saved successfully.
  sendAppointmentCreatedEmail({ ...booking.toObject(), user: req.user || null });

  res.status(201).json({ success: true, data: booking });
});

/**
 * GET availability for a stylist + service on a date.
 * GET /api/v1/appointments/availability?stylistId=..&serviceId=..&date=YYYY-MM-DD
 */
export const getAvailability = catchAsync(async (req, res, next) => {
  const { stylistId, serviceId, date } = req.query;
  if (!stylistId || !serviceId || !date) {
    return next(new AppError('stylistId, serviceId and date are required.', 400));
  }
  let params;
  try {
    params = await loadAvailabilityParams(stylistId, serviceId, date);
  } catch (e) {
    return next(e);
  }
  const { dayStart, duration } = params;

  const occupied = await getOccupiedIntervals(stylistId, dayStart, BLOCKING_STATUSES);
  const { openMin, closeMin, interval } = workingMinutes();
  const isToday = date === todayISTString();
  const nowMinutes = isToday ? minutesOfDayIST(new Date()) : -1;

  const slots = generateAvailableSlots({
    dayStart,
    duration,
    occupied,
    openMin,
    closeMin,
    interval,
    nowMinutes,
    isToday,
  });

  res.json({
    success: true,
    data: {
      date,
      stylistId,
      serviceId,
      duration,
      openTime: config.salon.openTime,
      closeTime: config.salon.closeTime,
      timezone: config.salon.timezone,
      availableSlots: slots.map((s) => s.time),
    },
  });
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

/**
 * Admin: update status (pending → confirmed / in_progress / completed / cancelled / no_show).
 * Confirming re-validates availability (another booking may have secured the window
 * since the original hold), so the admin can never double-book through confirmation.
 */
export const updateStatus = catchAsync(async (req, res, next) => {
  const { status, cancelReason, adminNote } = req.body;
  const allowed = ['pending', 'approved', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  if (!allowed.includes(status)) return next(new AppError('Invalid status.', 400));

  // 'approved' is a legacy alias — normalise it to 'confirmed'.
  const normalized = status === 'approved' ? 'confirmed' : status;

  const target = await Appointment.findById(req.params.id);
  if (!target) return next(new AppError('Appointment not found.', 404));

  // Confirmation protection: reject if another blocking appointment now overlaps.
  if (normalized === 'confirmed') {
    const conflict = await findConflictingAppointment(target);
    if (conflict) {
      return next(
        new AppError(
          `Cannot confirm — ${conflict.stylistName || 'the stylist'} already has ${conflict.serviceLabel} booked on ${formatDateIST(conflict.startTime)} at ${formatTimeIST(conflict.startTime)}–${formatTimeIST(conflict.endTime)}. Please adjust or cancel that appointment first.`,
          409
        )
      );
    }
    // Atomic re-reservation (releases any stale hold, then verifies the window).
    const reserved = await reserveSlot({
      appointmentId: target._id,
      stylistId: target.stylist || null,
      startTime: target.startTime,
      endTime: target.endTime,
      dayStart: target.date,
    });
    if (!reserved) {
      return next(new AppError('Cannot confirm — the stylist is no longer available at this time.', 409));
    }
  }

  const booking = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: normalized, ...(cancelReason ? { cancelReason } : {}), ...(adminNote ? { adminNote } : {}) },
    { new: true, runValidators: true }
  ).populate('user', 'name email phone');
  if (!booking) return next(new AppError('Appointment not found.', 404));

  // Releasing the hold: terminal states free the stylist's time again.
  if (['cancelled', 'completed', 'no_show'].includes(normalized)) {
    await releaseSlot(booking._id);
  }

  // Notify on real status changes only (never on re-saving the same status).
  // The persisted customer email is read from the appointment record, not the
  // request body. Emails are fire-and-forget: a delivery failure is logged and
  // never rolls back the confirmation/update that already succeeded in Mongo.
  const previousStatus = target.status === 'approved' ? 'confirmed' : target.status;
  if (previousStatus !== normalized) {
    const enriched = { ...booking.toObject(), user: booking.user || null };
    if (normalized === 'confirmed') {
      sendAppointmentConfirmedEmail(enriched);
    } else if (normalized === 'cancelled') {
      sendAppointmentCancelledEmail(enriched);
    } else if (normalized === 'completed') {
      sendAppointmentCompletedEmail(enriched);
    }
  }

  res.json({ success: true, data: booking });
});

/**
 * Admin: edit an appointment (stylist / services / combos / date / time / notes).
 * The same interval availability validation runs, excluding the appointment being
 * edited from its own conflict query.
 */
export const adminUpdate = catchAsync(async (req, res, next) => {
  const { services, combos, stylist, date, time, notes } = req.body;
  const existing = await Appointment.findById(req.params.id);
  if (!existing) return next(new AppError('Appointment not found.', 404));

  const newServices = services !== undefined
    ? (Array.isArray(services) ? services : [services])
    : (existing.services || []).map(String);
  const newCombos = combos !== undefined
    ? (Array.isArray(combos) ? combos : [combos])
    : (existing.combos || []).map(String);
  const newStylist = stylist !== undefined ? stylist : existing.stylist;
  const newDate = date !== undefined ? date : formatDateIST(existing.startTime || existing.date);
  const newTime = time !== undefined ? time : existing.time;

  for (const id of newServices) {
    if (!mongoose.isValidObjectId(id)) return next(new AppError('Invalid service selected.', 400));
  }
  if (newStylist && !mongoose.isValidObjectId(newStylist)) return next(new AppError('Invalid stylist selected.', 400));

  const { total, duration, services: foundServices, combos: foundCombos } = await computeTotal(newServices, newCombos);
  if (foundServices.length !== newServices.length || foundCombos.length !== newCombos.length) {
    return next(new AppError('One or more selected services could not be found.', 404));
  }
  if (foundServices.some((s) => !s.duration) || duration <= 0) {
    return next(new AppError('The selected service has no duration configured.', 400));
  }

  let stylistName = existing.stylistName;
  if (newStylist) {
    const s = await Stylist.findById(newStylist);
    if (!s) return next(new AppError('Selected stylist not found.', 400));
    stylistName = s.name;
  } else {
    stylistName = undefined;
  }

  let window;
  try {
    window = buildAppointmentWindow({ date: newDate, time: newTime, duration, requireFuture: false });
  } catch (e) {
    return next(e);
  }
  const { dayStart, startTime, endTime } = window;

  const newStylistId = newStylist ? String(newStylist) : null;
  const oldStylistId = existing.stylist ? String(existing.stylist) : null;
  const sameSlot =
    existing.startTime &&
    existing.endTime &&
    existing.startTime.getTime() === startTime.getTime() &&
    existing.endTime.getTime() === endTime.getTime() &&
    newStylistId === oldStylistId;

  // A blocking appointment that actually moved must re-validate availability.
  if (BLOCKING_STATUSES.includes(existing.status) && !sameSlot) {
    const reserved = await reserveSlot({
      appointmentId: existing._id,
      stylistId: newStylist || null,
      startTime,
      endTime,
      dayStart,
    });
    if (!reserved) {
      return next(new AppError('The new time overlaps another appointment for this stylist. Please choose another time.', 409));
    }
  }

  const updated = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      services: newServices,
      combos: newCombos,
      stylist: newStylist || undefined,
      stylistName,
      serviceSnapshots: foundServices.map((sv) => ({
        service: sv._id,
        name: sv.name,
        price: sv.offerPrice || sv.price,
        duration: sv.duration,
        image: sv.image,
      })),
      date: dayStart,
      time: newTime,
      startTime,
      endTime,
      duration,
      total,
      ...(notes !== undefined ? { notes } : {}),
    },
    { new: true, runValidators: true }
  ).populate('user services combos stylist', 'name email phone price offerPrice name role image');

  res.json({ success: true, data: updated });
});

/** Admin: full reservation details (with populated refs). */
export const getOne = catchAsync(async (req, res, next) => {
  const booking = await Appointment.findById(req.params.id).populate(
    'user services combos stylist',
    'name email phone price offerPrice name role image'
  );
  if (!booking) return next(new AppError('Appointment not found.', 404));
  res.json({ success: true, data: booking });
});

/** A signed-in customer's single reservation (scoped — 404 hides others'). */
export const myAppointment = catchAsync(async (req, res, next) => {
  const booking = await Appointment.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'services combos stylist',
    'name price offerPrice image role'
  );
  if (!booking) return next(new AppError('Appointment not found.', 404));
  res.json({ success: true, data: booking });
});

/** Customer cancels their own open reservation where allowed. */
export const cancelMyAppointment = catchAsync(async (req, res, next) => {
  const booking = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return next(new AppError('Appointment not found.', 404));
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return next(new AppError('This appointment can no longer be cancelled.', 400));
  }
  booking.status = 'cancelled';
  booking.cancelReason = 'Cancelled by customer';
  await booking.save();
  await releaseSlot(booking._id);
  sendAppointmentCancelledEmail({ ...booking.toObject(), user: req.user });
  res.json({ success: true, data: booking });
});

/** Get already-booked start times for a stylist on a date (legacy picker helper). */
export const getSlots = catchAsync(async (req, res, next) => {
  const { date, stylist } = req.query;
  if (!date) return next(new AppError('Date is required.', 400));
  const dayStart = dayStartIST(date);
  if (!dayStart) return next(new AppError('Invalid date.', 400));
  const end = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const query = { startTime: { $gte: dayStart, $lt: end }, status: { $in: BLOCKING_STATUSES } };
  if (stylist) query.stylist = stylist;
  const booked = await Appointment.find(query).select('time -_id');
  const times = booked.map((b) => b.time).filter(Boolean);
  res.json({ success: true, taken: [...new Set(times)] });
});

