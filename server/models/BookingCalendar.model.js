import mongoose from 'mongoose';

/**
 * Atomic interval reservation gate (per stylist + salon-local day).
 *
 * A plain unique index on { stylist, date, time } is NOT sufficient because two
 * bookings can overlap with *different* start times (10:00→11:00 vs 10:30→11:30).
 * Instead, each stylist+day has one document whose `slots` array holds reserved
 * [start, end) ranges. A booking is reserved by a single `updateOne` whose filter
 * matches only when no existing slot overlaps the requested interval — MongoDB
 * executes that filter + `$push` atomically for the document, so exactly one of
 * two concurrent overlapping requests can win.
 */
const calendarSlotSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false }
);

const bookingCalendarSchema = new mongoose.Schema(
  {
    stylist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stylist',
      default: null,
    },
    // Start-of-day instant in Asia/Kolkata (see utils/salonTime.js)
    date: { type: Date, required: true },
    slots: [calendarSlotSchema],
  },
  { timestamps: true }
);

// One gate document per stylist + day. Keeps the upsert-based reservation
// atomic and guarantees concurrent upserts don't create duplicate gates.
bookingCalendarSchema.index({ stylist: 1, date: 1 }, { unique: true });
// Support "release all entries for an appointment" lookups.
bookingCalendarSchema.index({ 'slots.appointment': 1 });

const BookingCalendar = mongoose.model('BookingCalendar', bookingCalendarSchema);
export default BookingCalendar;
