import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    file: String, // uploaded mp4 (public/videos or cloudinary)
    url: String, // external (youtube/vimeo)
    thumbnail: String,
    category: String,
    duration: Number,
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Video = mongoose.model('Video', videoSchema);
export default Video;
