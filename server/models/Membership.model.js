import mongoose from 'mongoose';

/** Recurring / one-time membership tiers (e.g. NOIR Gold, NOIR Black). */
const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    tagline: String,
    description: String,
    price: { type: Number, required: true, min: 0 },
    billing: { type: String, enum: ['monthly', 'yearly', 'one-time'], default: 'monthly' },
    image: String,
    perks: [String],
    savings: Number,
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;
