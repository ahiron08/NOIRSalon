import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Admin model — intentionally separate from regular Users so the control
 * plane stays isolated and secure.
 */
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'staff'],
      default: 'admin',
    },
    avatar: String,
    permissions: { type: [String], default: [] },
    lastLogin: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.correctPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
