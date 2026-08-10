import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: String,
    // 'image' → a static Instagram post / editorial photo.
    // 'reel'  → a short-form video (Instagram reel or studio clip).
    mediaType: { type: String, enum: ['image', 'reel'], default: 'image' },
    image: String,
    reelUrl: String,
    category: { type: String, enum: ['hair', 'makeup', 'bridal', 'facial', 'nail', 'men'], default: 'hair' },
    tags: [String],
    // 'upload'     → studio-managed item shown in the Portfolio gallery.
    // 'instagram'  → surfaced in the live Instagram feed section (fallback when no API token is set).
    source: { type: String, enum: ['upload', 'instagram'], default: 'upload' },
    permalink: String,   // click-through to the original Instagram post/reel
    mediaId: String,     // Instagram media id, used to de-dupe vs. the live API feed
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
