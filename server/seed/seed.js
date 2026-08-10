import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.model.js';
import Service from '../models/Service.model.js';
import Category from '../models/Category.model.js';
import Combo from '../models/Combo.model.js';
import Stylist from '../models/Stylist.model.js';
import Product from '../models/Product.model.js';
import Gallery from '../models/Gallery.model.js';
import Video from '../models/Video.model.js';
import Testimonial from '../models/Testimonial.model.js';
import Membership from '../models/Membership.model.js';
import Coupon from '../models/Coupon.model.js';
import Faq from '../models/Faq.model.js';
import { connectDB } from '../config/db.js';

dotenv.config();
// Use public resolvers for mongodb+srv so the cluster resolves even when the
// OS resolver is blocked/slow (mirrors server.js so seeding works the same way).
dns.setServers(['1.1.1.1', '8.8.8.8']);

const S = {
  Hair: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'Hair Spa': 'https://images.unsplash.com/photo-1516975087464-5356e60c8d4a?auto=format&fit=crop&w=800&q=80',
  Facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  Makeup: 'https://images.unsplash.com/photo-1522335789203-aabd20f54a8c?auto=format&fit=crop&w=800&q=80',
  Bridal: 'https://images.unsplash.com/photo-1596178060882-56444a1c5e54?auto=format&fit=crop&w=800&q=80',
  Massage: 'https://images.unsplash.com/photo-1600334129128-685c56a300c7?auto=format&fit=crop&w=800&q=80',
  Nail: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
  Men: 'https://images.unsplash.com/photo-1506794778202-cad8445c0bf8?auto=format&fit=crop&w=800&q=80',
};

async function seed() {
  await connectDB();
  await Promise.all([Admin.deleteMany({}), Category.deleteMany({}), Service.deleteMany({}), Combo.deleteMany({}), Stylist.deleteMany({}), Product.deleteMany({}), Gallery.deleteMany({}), Video.deleteMany({}), Testimonial.deleteMany({}), Membership.deleteMany({}), Coupon.deleteMany({}), Faq.deleteMany({})]);
  const pw = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 12);
  await Admin.create({ name: process.env.ADMIN_NAME || 'NOIR Admin', email: process.env.ADMIN_EMAIL || 'admin@noirsalon.in', password: process.env.ADMIN_PASSWORD || 'ChangeMe123!', role: 'superadmin', active: true });
  const cats = await Category.insertMany([
    { name: 'Hair', slug: 'hair', type: 'service', showOnHome: true },
    { name: 'Hair Spa', slug: 'hair-spa', type: 'service', showOnHome: true },
    { name: 'Facial', slug: 'facial', type: 'service', showOnHome: true },
    { name: 'Makeup', slug: 'makeup', type: 'service', showOnHome: true },
    { name: 'Nails', slug: 'nails', type: 'service', showOnHome: true },
    { name: 'Body', slug: 'body', type: 'service', showOnHome: true },
    { name: 'Men', slug: 'men', type: 'service', showOnHome: true },
  ]);
  const services = [
    ['Haircut & Styling', cats[0]._id, 800, 699, 45, ['Professional cut', 'Blow dry'], S.Hair],
    ['Hair Spa Ritual', cats[1]._id, 2500, 1999, 60, ['Deep conditioning', 'Scalp massage'], S['Hair Spa']],
    ['Signature Facial', cats[2]._id, 3000, 2499, 60, ['Cleanse', 'Extract', 'Mask'], S.Facial],
    ['Bridal Makeup', cats[3]._id, 15000, 12999, 180, ['HD finish', 'Trial'], S.Bridal],
    ['Luxury Manicure', cats[4]._id, 1200, 999, 45, ['Nail shaping'], S.Nail],
    ['Swedish Massage', cats[5]._id, 3000, 2499, 60, ['Full body', 'Aromatherapy'], S.Massage],
    ['Men\'s Haircut', cats[6]._id, 700, 599, 30, ['Precision cut', 'Beard trim'], S.Men],
  ];
  await Service.insertMany(services.map(x => ({ name: x[0], category: x[1], price: x[2], offerPrice: x[3], duration: x[4], benefits: x[5], suitableFor: 'All', description: 'Premium luxury experience.', featured: true, showOnHome: true, slug: x[0].toLowerCase().replace(/[^a-z0-9]+/g, '-'), image: x[6] })));
  const comboDefs = [
    ['Bride To Be', 25000, 19999, 480, ['Bridal makeup', 'Hair styling', 'Pre-bridal facial'], S.Bridal],
    ['Luxury Groom Package', 12000, 9999, 180, ['Haircut', 'Facial', 'Massage'], S.Men],
    ['Weekend Glow', 6000, 4999, 180, ['Facial', 'Manicure & pedicure', 'Hair spa'], S['Hair Spa']],
    ['Royal Hair Spa', 4500, 3499, 90, ['Hair spa', 'Scalp massage'], S['Hair Spa']],
    ['Couple Makeover', 10000, 8499, 240, ['Couple massage', 'Manicure & pedicure'], S.Massage],
    ['Student Package', 3000, 1999, 90, ['Haircut', 'Facial cleanup'], S.Hair],
  ];
  await Combo.insertMany(comboDefs.map(x => ({ name: x[0], originalPrice: x[1], offerPrice: x[2], estimatedDuration: x[3], features: x[4], image: x[5], slug: x[0].toLowerCase().replace(/[^a-z0-9]+/g, '-'), featured: true, showOnHome: true })));
  await Stylist.insertMany([
    { name: 'Ananya Sharma', role: 'Creative Director', bio: '15+ years editorial & bridal mastery.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80', instagram: '#', featured: true, active: true },
    { name: 'Rohit Bora', role: 'Senior Stylist', bio: 'Color specialist.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', instagram: '#', featured: true, active: true },
    { name: 'Priya Kalita', role: 'Makeup Artist', bio: 'Bridal & HD makeup.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', instagram: '#', featured: true, active: true },
    { name: 'Aman Choudhury', role: 'Grooming Specialist', bio: 'Men\'s grooming.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad8445c0bf8?auto=format&fit=crop&w=600&q=80', instagram: '#', featured: true, active: true },
  ]);
  await Product.insertMany([
    { name: 'NOIR Luxury Hair Oil', slug: 'noir-luxury-hair-oil', category: cats[0]._id, price: 1200, compareAtPrice: 1500, stock: 60, brand: 'NOIR', rating: 4.8, numReviews: 120, featured: true, description: 'Premium argan oil blend for silky, shiny hair. Lightweight formula that nourishes without weighing hair down.', sku: 'NOIR-HO-001', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Hydra Facial Serum', slug: 'hydra-facial-serum', category: cats[2]._id, price: 2500, compareAtPrice: 3200, stock: 80, brand: 'NOIR', rating: 4.9, numReviews: 210, featured: true, description: 'Intensive hydrating serum with hyaluronic acid and vitamin C. Brightens, plumps, and revitalizes skin.', sku: 'NOIR-FS-002', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80' },
    { name: 'Bridal Makeup Kit', slug: 'bridal-makeup-kit', category: cats[3]._id, price: 6500, compareAtPrice: 8500, stock: 40, brand: 'NOIR', rating: 4.7, numReviews: 95, featured: true, description: 'Complete bridal makeup kit with long-lasting HD formulas. Includes primer, foundation, concealer, setting spray, and brushes.', sku: 'NOIR-BM-003', image: 'https://images.unsplash.com/photo-1586495777744-9df6c9e219e2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Spa Gift Card 2000', slug: 'spa-gift-card-2000', category: cats[4]._id, price: 2000, stock: 999, brand: 'NOIR', rating: 5, numReviews: 340, featured: true, description: 'The perfect gift for luxury spa experiences. Valid for all services at NOIR Salon.', sku: 'NOIR-GC-004', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80' },
    { name: 'Argan Hair Mask', slug: 'argan-hair-mask', category: cats[0]._id, price: 1800, compareAtPrice: 2200, stock: 50, brand: 'NOIR', rating: 4.6, numReviews: 85, featured: false, description: 'Deep conditioning hair mask with pure argan oil and keratin. Repairs damage and restores shine.', sku: 'NOIR-HM-005', image: 'https://images.unsplash.com/photo-1556228720-19de75204e69?auto=format&fit=crop&w=800&q=80' },
    { name: 'Gold Facial Kit', slug: 'gold-facial-kit', category: cats[2]._id, price: 3500, compareAtPrice: 4200, stock: 35, brand: 'NOIR', rating: 4.8, numReviews: 67, featured: true, description: 'Luxury 24k gold facial kit with collagen peptides. Firms, lifts, and illuminates skin for a radiant glow.', sku: 'NOIR-GF-006', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80' },
    { name: 'Matte Lipstick Collection', slug: 'matte-lipstick-collection', category: cats[3]._id, price: 2400, compareAtPrice: 3000, stock: 70, brand: 'NOIR', rating: 4.7, numReviews: 156, featured: false, description: 'Set of 4 long-wearing matte lipsticks in classic shades. Highly pigmented with moisturizing formula.', sku: 'NOIR-ML-007', image: 'https://images.unsplash.com/photo-1586495777744-9df6c9e219e2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Nail Polish Set', slug: 'nail-polish-set', category: cats[4]._id, price: 1500, compareAtPrice: 1800, stock: 90, brand: 'NOIR', rating: 4.5, numReviews: 203, featured: false, description: 'Professional-grade nail polish set with 6 trending shades. Quick-dry, chip-resistant formula.', sku: 'NOIR-NP-008', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80' },
    { name: 'Men\'s Grooming Kit', slug: 'mens-grooming-kit', category: cats[6]._id, price: 2800, compareAtPrice: 3500, stock: 45, brand: 'NOIR', rating: 4.8, numReviews: 112, featured: true, description: 'Complete men\'s grooming kit with beard oil, face wash, moisturizer, and precision trimmer.', sku: 'NOIR-MG-009', image: 'https://images.unsplash.com/photo-1506794778202-cad8445c0bf8?auto=format&fit=crop&w=800&q=80' },
    { name: 'Body Lotion Luxe', slug: 'body-lotion-luxe', category: cats[5]._id, price: 1600, compareAtPrice: 2000, stock: 75, brand: 'NOIR', rating: 4.6, numReviews: 89, featured: false, description: 'Rich, nourishing body lotion with shea butter and vitamin E. Absorbs quickly for soft, hydrated skin.', sku: 'NOIR-BL-010', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80' },
  ]);
  await Gallery.insertMany([
    { title: 'Bridal Glow', category: 'bridal', image: 'https://images.unsplash.com/photo-1596178060882-56444a1c5e54?auto=format&fit=crop&w=800&q=80', featured: true, active: true },
    { title: 'Precision Cut', category: 'hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', featured: true, active: true },
    { title: 'Luxury Makeup', category: 'makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd20f54a8c?auto=format&fit=crop&w=800&q=80', featured: true, active: true },
    { title: 'Nail Art', category: 'nail', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80', featured: true, active: true },
    { title: 'Relaxing Facial', category: 'facial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', featured: true, active: true },
  ]);
  // sample reels (self-managed short-form clips) — mediaType 'reel'
  await Gallery.insertMany([
    { title: 'Signature Glow Reveal', mediaType: 'reel', image: 'https://images.unsplash.com/photo-1596178060882-56444a1c5e54?auto=format&fit=crop&w=800&q=80', reelUrl: '/videos/hero.mp4', category: 'makeup', active: true },
    { title: 'From Dull to Deluxe', mediaType: 'reel', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', reelUrl: '/videos/hero.mp4', category: 'hair', active: true },
  ]);
  // curated Instagram feed items (shown in the live feed section when no API token is set)
  await Gallery.insertMany([
    { title: 'Golden hour, NOIR style.', mediaType: 'image', source: 'instagram', category: 'hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', permalink: 'https://www.instagram.com/noir.salon/', active: true },
    { title: 'Bridal magic ✨', mediaType: 'image', source: 'instagram', category: 'bridal', image: 'https://images.unsplash.com/photo-1596178060882-56444a1c5e54?auto=format&fit=crop&w=800&q=80', permalink: 'https://www.instagram.com/noir.salon/', active: true },
    { title: 'Behind the chair.', mediaType: 'reel', source: 'instagram', category: 'hair', image: 'https://images.unsplash.com/photo-1506794778202-cad8445c0bf8?auto=format&fit=crop&w=800&q=80', reelUrl: '/videos/hero.mp4', permalink: 'https://www.instagram.com/noir.salon/reels/', active: true },
  ]);
  await Video.create({ title: 'NOIR — The Experience', description: 'A cinematic journey.', file: '/videos/hero.mp4', featured: true, active: true });
  await Testimonial.insertMany([
    { name: 'Megha Das', rating: 5, text: 'Absolutely divine experience.', service: 'Bridal Makeup', source: 'google', featured: true, active: true },
    { name: 'Vikram Singh', rating: 5, text: 'Best men\'s grooming in Guwahati.', service: 'Men\'s Haircut', source: 'manual', featured: true, active: true },
    { name: 'Riya Sharma', rating: 5, text: 'My hair has never looked better.', service: 'Premium Highlights', source: 'google', featured: true, active: true },
  ]);
  await Membership.insertMany([
    { name: 'NOIR Gold', slug: 'noir-gold', tagline: 'Monthly luxury indulgence', price: 2999, billing: 'monthly', perks: ['15% off', 'Priority booking'], savings: 4500, featured: true, active: true },
    { name: 'NOIR Black', slug: 'noir-black', tagline: 'Ultimate VIP membership', price: 9999, billing: 'yearly', perks: ['30% off', 'Exclusive events'], savings: 25000, featured: true, active: true },
  ]);
  await Coupon.insertMany([
    { code: 'NOIR10', type: 'percent', value: 10, minOrder: 2000, usageLimit: 100, perUserLimit: 1, active: true },
    { code: 'WELCOME500', type: 'fixed', value: 500, minOrder: 3000, usageLimit: 200, perUserLimit: 1, active: true },
  ]);
  await Faq.insertMany([
    { question: 'Where is NOIR SALON?', answer: 'In the heart of Guwahati.', category: 'location', order: 1, active: true },
    { question: 'Home services?', answer: 'Yes, available for members.', category: 'services', order: 2, active: true },
    { question: 'Payment methods?', answer: 'Cash, Razorpay, Stripe, Gift Cards.', category: 'payment', order: 3, active: true },
  ]);
  console.log('[Seed] dummy data created successfully.');
  process.exit(0);
}
seed().catch((e) => { console.error('[Seed] failed', e); process.exit(1); });
