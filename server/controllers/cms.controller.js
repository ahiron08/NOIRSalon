import { createFactory } from './factory.js';
import Service from '../models/Service.model.js';
import Category from '../models/Category.model.js';
import Combo from '../models/Combo.model.js';
import Stylist from '../models/Stylist.model.js';
import Product from '../models/Product.model.js';
import Gallery from '../models/Gallery.model.js';
import Video from '../models/Video.model.js';
import Blog from '../models/Blog.model.js';
import Review from '../models/Review.model.js';
import Testimonial from '../models/Testimonial.model.js';
import Membership from '../models/Membership.model.js';
import GiftCard from '../models/GiftCard.model.js';
import Coupon from '../models/Coupon.model.js';
import Faq from '../models/Faq.model.js';

/**
 * One consolidated controller bag for the CMS-managed content resources.
 * Each object exposes the standard REST handlers from the factory.
 */

export const services = createFactory(Service, {
  populate: 'category',
  searchFields: ['name', 'description', 'category'],
});

export const categories = createFactory(Category, { searchFields: ['name'] });

export const combos = createFactory(Combo, {
  populate: 'includes.service',
  searchFields: ['name', 'description'],
});

export const stylists = createFactory(Stylist, { searchFields: ['name', 'role', 'specializations'] });

export const products = createFactory(Product, {
  populate: 'category',
  searchFields: ['name', 'brand', 'description'],
});

export const gallery = createFactory(Gallery, { searchFields: ['title', 'category'] });

export const videos = createFactory(Video, { searchFields: ['title', 'description'] });

export const blogs = createFactory(Blog, { searchFields: ['title', 'excerpt', 'content'] });

export const reviews = createFactory(Review, {
  populate: 'user product',
  searchFields: ['name', 'comment'],
});

export const testimonials = createFactory(Testimonial, { searchFields: ['name', 'text'] });

export const memberships = createFactory(Membership, { searchFields: ['name', 'tagline'] });

export const giftCards = createFactory(GiftCard, { searchFields: ['recipientName', 'recipientEmail'] });

export const coupons = createFactory(Coupon, { searchFields: ['code'] });

export const faqs = createFactory(Faq, { searchFields: ['question', 'answer'], populate: '' });
