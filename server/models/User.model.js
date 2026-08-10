import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    passwordConfirm: { type: String, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    avatar: String,
    isVerified: { type: Boolean, default: false },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: String,

    addresses: [addressSchema],
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

    // email verification
    verificationToken: String,
    verificationExpires: Date,
    // password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    passwordChangedAt: Date,
    active: { type: Boolean, default: true, select: false },
  },
  { timestamps: true }
);

/* ---- pre-save password hashing ---- */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

/* ---- instance helpers ---- */
userSchema.methods.correctPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTime) {
  if (!this.passwordChangedAt) return false;
  const changed = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return JWTTime < changed;
};

userSchema.methods.createVerificationToken = function () {
  const token = crypto.randomBytes(24).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(24).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.model('User', userSchema);
export default User;
