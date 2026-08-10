import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    combos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Combo' }],
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: 'Stylist' },

    // guest booking fields
    guestName: String,
    guestEmail: String,
    guestPhone: String,

    // reservation details
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "14:30"
    duration: Number,
    notes: String,

    total: { type: Number, default: 0 },
    depositPaid: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
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

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
