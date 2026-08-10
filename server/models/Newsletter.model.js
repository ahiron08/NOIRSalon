import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: String,
    source: { type: String, default: 'footer' },
    subscribed: { type: Boolean, default: true },
    unsubscribedAt: Date,
  },
  { timestamps: true }
);

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;
