import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({}, { strict: false });

/** Homepage CMS — admin edits which sections show on the landing page. */
const homepageSchema = new mongoose.Schema(
  {
    hero: sectionSchema,
    services: sectionSchema,
    combos: sectionSchema,
    whyChoose: sectionSchema,
    stylists: sectionSchema,
    instagramFeed: sectionSchema,
    videoShowcase: sectionSchema,
    testimonials: sectionSchema,
    awards: sectionSchema,
    brands: sectionSchema,
    bookCta: sectionSchema,
  },
  { timestamps: true }
);

const Homepage = mongoose.model('Homepage', homepageSchema);
export default Homepage;
