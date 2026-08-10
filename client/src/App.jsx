import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { UIProvider } from './contexts/UIContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Loading from './components/shared/Loading.jsx';
import RequireAdmin from './components/layout/RequireAdmin.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'));
const Combos = lazy(() => import('./pages/Combos.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Videos = lazy(() => import('./pages/Videos.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Team = lazy(() => import('./pages/Team.jsx'));
const Testimonials = lazy(() => import('./pages/Testimonials.jsx'));
const Membership = lazy(() => import('./pages/Membership.jsx'));
const GiftCards = lazy(() => import('./pages/GiftCards.jsx'));
const Reservations = lazy(() => import('./pages/Reservations.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const Careers = lazy(() => import('./pages/Careers.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminStylists = lazy(() => import('./pages/admin/AdminStylists.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminCombos = lazy(() => import('./pages/admin/AdminCombos.jsx'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery.jsx'));
const AdminVideos = lazy(() => import('./pages/admin/AdminVideos.jsx'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs.jsx'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials.jsx'));
const AdminMemberships = lazy(() => import('./pages/admin/AdminMemberships.jsx'));
const AdminFaqs = lazy(() => import('./pages/admin/AdminFaqs.jsx'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons.jsx'));
const AdminGiftCards = lazy(() => import('./pages/admin/AdminGiftCards.jsx'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function IntroPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // After splash video completes, redirect to home
    const timer = setTimeout(() => navigate('/home', { replace: true }), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <UIProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<IntroPage />} />
                <Route path="/home" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="services" element={<Services />} />
                  <Route path="services/:slug" element={<ServiceDetails />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:slug" element={<ProductDetails />} />
                  <Route path="combos" element={<Combos />} />
                  <Route path="gallery" element={<Gallery />} />
                  <Route path="videos" element={<Videos />} />
                  <Route path="about" element={<About />} />
                  <Route path="team" element={<Team />} />
                  <Route path="testimonials" element={<Testimonials />} />
                  <Route path="membership" element={<Membership />} />
                  <Route path="gift-cards" element={<GiftCards />} />
                  <Route path="reservations" element={<Reservations />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:slug" element={<BlogPost />} />
                  <Route path="careers" element={<Careers />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                {/* Fallback routes for backward compatibility */}
                <Route path="/services" element={<Layout />}>
                  <Route index element={<Services />} />
                  <Route path=":slug" element={<ServiceDetails />} />
                </Route>
                <Route path="/products" element={<Layout />}>
                  <Route index element={<Products />} />
                  <Route path=":slug" element={<ProductDetails />} />
                </Route>
                <Route path="/combos" element={<Combos />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/about" element={<About />} />
                <Route path="/team" element={<Team />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/gift-cards" element={<GiftCards />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />

                {/* Admin portal (accessed by typing /admin) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="stylists" element={<AdminStylists />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="combos" element={<AdminCombos />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="videos" element={<AdminVideos />} />
                  <Route path="blogs" element={<AdminBlogs />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="memberships" element={<AdminMemberships />} />
                  <Route path="faqs" element={<AdminFaqs />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="giftcards" element={<AdminGiftCards />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="contacts" element={<AdminContacts />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </UIProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

