import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, trim: true },
    image: String,
    images: [String],
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0 },
    // Duration in MINUTES (integer, strictly positive) — the server uses this to
    // compute appointment end times and availability. Stored as minutes (never a
    // string like "1 hour") so arithmetic and validation stay reliable.
    duration: {
      type: Number,
      required: true,
      default: 45,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Duration must be a whole number of minutes.',
      },
    },
    benefits: [String],
    steps: [String],
    suitableFor: String,
    featured: { type: Boolean, default: false },
    showOnHome: { type: Boolean, default: false },
    rentals: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ name: 'text', description: 'text' });

serviceSchema.virtual('discount').get(function () {
  if (!this.offerPrice) return 0;
  return Math.round(((this.price - this.offerPrice) / this.price) * 100);
});

serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
