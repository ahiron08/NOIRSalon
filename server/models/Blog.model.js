import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    excerpt: String,
    content: { type: String, required: true }, // rich HTML
    cover: String,
    category: { type: String, default: 'Beauty' },
    tags: [String],
    author: { type: String, default: 'NOIR Editorial' },
    authorImage: String,
    readTime: Number,
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: Date,
    featured: { type: Boolean, default: false },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
