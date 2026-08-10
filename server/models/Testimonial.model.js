import mongoose from 'mongoose';

/**
 * External/testimonial reviews (Google-style). Dummy data ships by default;
 * swap to live Google Places API responses later without schema changes.
 */
const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    photo: String,
    source: { type: String, enum: ['google', 'manual', 'facebook', 'instagram'], default: 'manual' },
    text: { type: String, required: true },
    service: String,
    date: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
