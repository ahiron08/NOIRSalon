import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, required: true, min: 0 }, // percent or fixed ₹
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    appliesTo: { type: String, enum: ['all', 'products', 'services', 'combos'], default: 'all' },
    startsAt: Date,
    expiresAt: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (subtotal, userUsed = 0) {
  if (!this.active) return { ok: false, message: 'Coupon is inactive.' };
  if (this.expiresAt && this.expiresAt < new Date()) return { ok: false, message: 'Coupon has expired.' };
  if (this.startsAt && this.startsAt > new Date()) return { ok: false, message: 'Coupon not yet valid.' };
  if (subtotal < this.minOrder) return { ok: false, message: `Minimum order ₹${this.minOrder} required.` };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { ok: false, message: 'Coupon usage limit reached.' };
  if (this.perUserLimit && userUsed >= this.perUserLimit) return { ok: false, message: 'Coupon already used by you.' };
  return { ok: true };
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
