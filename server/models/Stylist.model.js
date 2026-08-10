import mongoose from 'mongoose';

const stylistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: String,
    avatar: String,
    cover: String,
    bio: String,
    specializations: [String],
    experienceYears: Number,
    instagram: String,
    facebook: String,
    featured: { type: Boolean, default: false },
    bookable: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

stylistSchema.set('toJSON', { virtuals: true });

const Stylist = mongoose.model('Stylist', stylistSchema);
export default Stylist;
