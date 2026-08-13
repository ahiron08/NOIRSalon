import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    combos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Combo' }],
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: 'Stylist' },

    // Historical snapshot so a reservation stays displayable even if the
    // underlying service/stylist is later edited or removed.
    serviceSnapshots: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        name: String,
        price: Number,
        duration: Number,
        image: String,
        _id: false,
      },
    ],
    stylistName: String,

    // guest booking fields
    guestName: String,
    guestEmail: String,
    guestPhone: String,

    // reservation details
    // `date` is the calendar day normalised to its start in Asia/Kolkata
    // (e.g. 2026-08-20T00:00:00+05:30). `time` is the salon-local start "HH:MM".
    // `startTime` / `endTime` are the absolute instants (still Asia/Kolkata) used
    // for interval mathematics and overlap detection.
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "14:30" salon-local start
    startTime: { type: Date },
    endTime: { type: Date },
    duration: Number, // total minutes, computed server-side at booking time
    notes: String,

    total: { type: Number, default: 0 },
    depositPaid: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    channel: { type: String, enum: ['web', 'phone', 'walkin', 'whatsapp'], default: 'web' },

    cancelReason: String,
    adminNote: String,
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, stylist: 1 });
appointmentSchema.index({ user: 1, status: 1 });
appointmentSchema.index({ stylist: 1, startTime: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
