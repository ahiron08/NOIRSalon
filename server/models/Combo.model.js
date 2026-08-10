import mongoose from 'mongoose';

/** Premium combo package (e.g. Bride To Be, Wedding Collection). */
const comboItemSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    name: String,
    note: String,
  },
  { _id: false }
);

const comboSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    tagline: String,
    description: String,
    image: String,
    originalPrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
    estimatedDuration: Number, // minutes
    includes: [comboItemSchema],
    features: [String],
    featured: { type: Boolean, default: false },
    showOnHome: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

comboSchema.virtual('savings').get(function () {
  return Math.max(0, this.originalPrice - this.offerPrice);
});

comboSchema.virtual('savingsPercent').get(function () {
  if (!this.originalPrice) return 0;
  return Math.round((this.savings / this.originalPrice) * 100);
});

comboSchema.set('toJSON', { virtuals: true });
comboSchema.set('toObject', { virtuals: true });

const Combo = mongoose.model('Combo', comboSchema);
export default Combo;
