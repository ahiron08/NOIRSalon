/**
 * Stylist availability engine.
 *
 * Everything here shares a single interval-overlap rule:
 *
 *     newStart < existingEnd && newEnd > existingStart
 *
 * applied consistently in the availability endpoint, reservation creation,
 * admin confirmation and admin editing.
 */
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.model.js';
import BookingCalendar from '../models/BookingCalendar.model.js';
import Stylist from '../models/Stylist.model.js';
import Service from '../models/Service.model.js';
import AppError from '../utils/AppError.js';
import {
  dayStartIST,
  dateTimeIST,
  formatDateIST,
  formatTimeIST,
  minutesOfDayIST,
  todayISTString,
  timeToMinute,
} from '../utils/salonTime.js';
import { config } from '../config/index.js';

/**
 * Statuses that occupy a stylist's time.
 * - `pending` acts as a temporary hold: once a customer requests a slot it stops
 *   other customers from taking an overlapping slot at the same stylist, and the
 *   admin may later confirm or cancel it. This prevents two pending bookings from
 *   double-claiming the same window.
 * - `confirmed` / `approved` / `in_progress` are definitively blocking.
 */
export const BLOCKING_STATUSES = ['pending', 'approved', 'confirmed', 'in_progress'];

/** Only these "hard" statuses block an otherwise-pending confirmation. */
export const CONFIRMED_BLOCKING_STATUSES = ['approved', 'confirmed', 'in_progress'];

/** Interval overlap rule used everywhere. */
export function isOverlapping(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/** Salon working-hours configuration in minutes-of-day (+ grid interval). */
export function workingMinutes() {
  return {
    openMin: timeToMinute(config.salon.openTime) ?? 10 * 60,
    closeMin: timeToMinute(config.salon.closeTime) ?? 19 * 60,
    interval: Math.max(5, config.salon.slotIntervalMinutes || 30),
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Load occupied [start,end) intervals on a given (stylist, day) among blocking statuses. */
export async function getOccupiedIntervals(stylistId, dayStart, statuses = BLOCKING_STATUSES) {
  const start = new Date(dayStart);
  const end = new Date(start.getTime() + DAY_MS);
  const docs = await Appointment.find({
    stylist: stylistId ?? null,
    startTime: { $gte: start, $lt: end },
    status: { $in: statuses },
  })
    .select('startTime endTime time')
    .lean();
  return docs
    .filter((d) => d.startTime && d.endTime)
    .map((d) => ({ startTime: d.startTime, endTime: d.endTime }));
}

/**
 * Generate all bookable start times for a (stylist, day) given a service duration.
 * Every returned slot has a full `duration` of uninterrupted time: candidates are
 * advanced on the salon grid from opening, must end at/before closing, must not
 * overlap any occupied interval, and (today only) must not start in the past.
 */
export function generateAvailableSlots({
  dayStart,
  duration,
  occupied,
  openMin,
  closeMin,
  interval,
  nowMinutes = -1,
  isToday = false,
}) {
  const slots = [];
  const lastStart = closeMin - duration; // must finish before closing
  for (let t = openMin; t <= lastStart; t += interval) {
    if (isToday && t <= nowMinutes) continue; // no past slots
    const start = new Date(dayStart.getTime() + t * 60000);
    const end = new Date(start.getTime() + duration * 60000);
    let overlap = false;
    for (const o of occupied) {
      if (isOverlapping(start, end, o.startTime, o.endTime)) {
        overlap = true;
        break;
      }
    }
    if (!overlap) slots.push({ start, end, time: formatTimeIST(start) });
  }
  return slots;
}

/** Collect all gate entries belonging to an appointment (across stylists/days). */
async function releaseAllEntries(appointmentId) {
  const docs = await BookingCalendar.find({ 'slots.appointment': appointmentId });
  const removed = [];
  for (const doc of docs) {
    const idStr = String(appointmentId);
    const mine = doc.slots.filter((s) => String(s.appointment) === idStr);
    const others = doc.slots.filter((s) => String(s.appointment) !== idStr);
    if (mine.length && others.length) {
      doc.slots = others;
      await doc.save();
    } else if (mine.length) {
      await doc.deleteOne();
    }
    for (const s of mine) {
      removed.push({ stylist: doc.stylist || null, date: doc.date, start: s.start, end: s.end });
    }
  }
  return removed;
}

/**
 * Atomically reserve `[startTime, endTime)` for an appointment on a stylist/day.
 * Assumes ownership of the appointment's previous entries (released first) so an
 * edit or re-confirmation never conflicts with itself. Returns true on success,
 * false if the interval overlaps another booking.
 */
export async function reserveSlot({ appointmentId, stylistId, startTime, endTime, dayStart }) {
  const removed = await releaseAllEntries(appointmentId);
  if (!startTime || !endTime) return false;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const day = new Date(dayStart);
  const stylist = stylistId || null;

  const filter = {
    stylist,
    date: day,
    $or: [
      { slots: { $exists: false } },
      { slots: { $size: 0 } },
      {
        slots: {
          $not: { $elemMatch: { start: { $lt: end }, end: { $gt: start } } },
        },
      },
    ],
  };
  const update = { $push: { slots: { appointment: appointmentId, start, end } } };

  // First attempt: upsert (may create the stylist/day gate document).
  // Concurrent upserts for the same (stylist, date) are serialised by the unique
  // index — the second one throws an E11000 duplicate-key instead of matching, so
  // we catch it and retry as a plain update against the now-existing document.
  let upd;
  try {
    upd = await BookingCalendar.updateOne(filter, update, { upsert: true });
  } catch (err) {
    if (err?.code !== 11000) throw err;
    upd = await BookingCalendar.updateOne(filter, update); // no upsert, no $or-insert quirk
  }

  if (upd.modifiedCount === 1 || upd.upsertedCount === 1) return true;

  // Conflict — restore the entries we just released (best effort).
  await Promise.all(
    removed.map((r) =>
      BookingCalendar.updateOne(
        {
          stylist: r.stylist || null,
          date: r.date,
          $or: [
            { slots: { $exists: false } },
            { slots: { $size: 0 } },
            {
              slots: {
                $not: { $elemMatch: { start: { $lt: r.end }, end: { $gt: r.start } } },
              },
            },
          ],
        },
        { $push: { slots: { appointment: appointmentId, start: r.start, end: r.end } } },
        { upsert: true }
      )
    )
  );
  return false;
}

/** Release any gate entries held by an appointment (cancel / complete / no-show). */
export async function releaseSlot(appointmentId) {
  await releaseAllEntries(appointmentId);
}

const serviceLabel = (appt) =>
  Array.isArray(appt.serviceSnapshots) && appt.serviceSnapshots[0]?.name
    ? appt.serviceSnapshots[0].name
    : 'appointment';

/**
 * Find another blocking appointment that overlaps `appt` for the same stylist
 * (excluding appt itself). Used by the admin confirmation re-check.
 */
export async function findConflictingAppointment(appt) {
  if (!appt.startTime || !appt.endTime) return null;
  const day = dayStartIST(formatDateIST(appt.startTime));
  if (!day) return null;
  const dayEnd = new Date(day.getTime() + DAY_MS);
  const others = await Appointment.find({
    _id: { $ne: appt._id },
    stylist: appt.stylist || null,
    startTime: { $gte: day, $lt: dayEnd },
    status: { $in: CONFIRMED_BLOCKING_STATUSES },
  })
    .select('startTime endTime stylistName serviceSnapshots services')
    .populate('services', 'name')
    .lean();

  for (const other of others) {
    if (!other.startTime || !other.endTime) continue;
    if (isOverlapping(appt.startTime, appt.endTime, other.startTime, other.endTime)) {
      return { ...other, serviceLabel: serviceLabel(other) };
    }
  }
  return null;
}

/**
 * Resolve + validate stylist & service and return the service duration.
 * Throws AppError (404/400) when missing or invalid.
 */
export async function loadAvailabilityParams(stylistId, serviceId, date) {
  if (!mongoose.isValidObjectId(stylistId)) {
    throw new AppError('Invalid stylist selected.', 400);
  }
  if (!mongoose.isValidObjectId(serviceId)) {
    throw new AppError('Invalid service selected.', 400);
  }
  const dayStart = dayStartIST(date);
  if (!dayStart) throw new AppError('Invalid date.', 400);

  const [stylist, service] = await Promise.all([
    Stylist.findById(stylistId),
    Service.findById(serviceId),
  ]);
  if (!stylist) throw new AppError('Stylist not found.', 404);
  if (!service) throw new AppError('Service not found.', 404);

  const duration = service.duration;
  if (!Number.isInteger(duration) || duration <= 0) {
    throw new AppError('This service has no valid duration configured.', 400);
  }
  return { stylist, service, dayStart, duration };
}

export {
  dayStartIST,
  dateTimeIST,
  formatDateIST,
  formatTimeIST,
  minutesOfDayIST,
  todayISTString,
};
