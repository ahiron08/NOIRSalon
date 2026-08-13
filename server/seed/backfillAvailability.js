/**
 * Migration / backfill for the stylist-availability feature.
 *
 * Run once after deploying this feature:
 *
 *     npm run backfill:availability -w server
 *
 * (or `node seed/backfillAvailability.js` from server/)
 *
 * What it does
 * ------------
 * 1. Services missing `duration` get the salon's default of 45 minutes. 45 is
 *    chosen because it is the existing Service schema default and the baseline
 *    duration used for seeded services (Haircut, Manicure). No other value is
 *    assigned — services that already have a duration are left untouched.
 * 2. Every appointment's `date` is normalised to the start of its day in
 *    Asia/Kolkata and `startTime` / `endTime` are computed from
 *    `date` + `time` + `duration`. Existing `duration` is preserved; if absent,
 *    it is the sum of the appointment's serviceSnapshots durations, falling back
 *    to 45 (logged).
 * 3. The BookingCalendar atomic-reservation gate is rebuilt from all blocking
 *    appointments (pending / approved / confirmed / in_progress).
 *
 * Historical records are never mutated beyond normalising the time fields; the
 * existing `date`/`time`/`duration` values are the source for the computation.
 */
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import Service from '../models/Service.model.js';
import Appointment from '../models/Appointment.model.js';
import BookingCalendar from '../models/BookingCalendar.model.js';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import {
  BLOCKING_STATUSES,
} from '../services/availability.service.js';
import {
  dayStartIST,
  dateTimeIST,
  formatDateIST,
  TIME_RE,
} from '../utils/salonTime.js';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const DEFAULT_DURATION = 45;

const fmt = (date) => (date ? formatDateIST(date) : null);

const main = async () => {
  await connectToDatabase();

  // 1) Service duration backfill.
  const missing = await Service.find({ duration: { $exists: false } }).select('name').lean();
  if (missing.length) {
    const r = await Service.updateMany(
      { duration: { $exists: false } },
      { $set: { duration: DEFAULT_DURATION } }
    );
    console.log(
      `[backfill] Assigned ${DEFAULT_DURATION}-minute duration to ${r.modifiedCount} service(s): ${missing.map((s) => s.name).join(', ')}`
    );
  } else {
    console.log('[backfill] No services missing a duration.');
  }

  // 2) Normalise appointment times.
  const appts = await Appointment.find({}).lean();
  let normalized = 0;
  let skipped = 0;
  const calendar = new Map(); // key `${stylist}|${dayStartMs}` -> slot array

  const upsertCalendar = (stylistStr, dayStart, slot) => {
    const key = `${stylistStr || 'none'}|${new Date(dayStart).getTime()}`;
    if (!calendar.has(key)) calendar.set(key, { stylist: stylistStr || null, date: new Date(dayStart), slots: [] });
    calendar.get(key).slots.push(slot);
  };

  for (const a of appts) {
    const calDate = a.startTime ? formatDateIST(a.startTime) : fmt(a.date);
    if (!calDate || !TIME_RE.test(a.time || '')) {
      skipped += 1;
      console.log(`[backfill] Skipped appointment ${a._id} (no valid date/time: date=${fmt(a.date)}, time=${a.time}).`);
      continue;
    }
    let duration = a.duration;
    if (!duration && Array.isArray(a.serviceSnapshots)) {
      duration = a.serviceSnapshots.reduce((s, x) => s + (x.duration || 0), 0);
    }
    if (!duration) {
      duration = DEFAULT_DURATION;
      console.log(`[backfill] Appointment ${a._id} had no duration — using default ${DEFAULT_DURATION} min.`);
    }
    const dayStart = dayStartIST(calDate);
    const startTime = dateTimeIST(calDate, a.time);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    await Appointment.updateOne(
      { _id: a._id },
      { $set: { date: dayStart, time: a.time, startTime, endTime, duration, status: a.status } }
    );
    normalized += 1;

    if (BLOCKING_STATUSES.includes(a.status)) {
      upsertCalendar(a.stylist ? String(a.stylist) : null, dayStart, {
        appointment: a._id,
        start: startTime,
        end: endTime,
      });
    }
  }

  // 3) Rebuild the booking gate.
  await BookingCalendar.deleteMany({});
  const gates = [...calendar.values()];
  if (gates.length) {
    await BookingCalendar.insertMany(gates, { ordered: false });
  }

  console.log(
    `[backfill] Appointments normalised: ${normalized} (skipped ${skipped}); BookingCalendar rebuilt with ${gates.length} stylist-day gate document(s).`
  );

  await disconnectFromDatabase();
  process.exit(0);
};

main().catch(async (e) => {
  console.error('[backfill] Failed:', e);
  await disconnectFromDatabase().catch(() => {});
  process.exit(1);
});
