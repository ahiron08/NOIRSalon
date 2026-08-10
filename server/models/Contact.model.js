import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    topic: { type: String, default: 'general' },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
    readAt: Date,
  },
  { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
