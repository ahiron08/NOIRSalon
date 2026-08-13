import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { adminApi } from '../../services/api.js';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { path: '/admin/services', label: 'Services', icon: '✂️' },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/stylists', label: 'Team', icon: '👥' },
  { path: '/admin/categories', label: 'Categories', icon: '📁' },
  { path: '/admin/combos', label: 'Combos', icon: '💎' },
  { path: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
  { path: '/admin/videos', label: 'Videos', icon: '🎬' },
  { path: '/admin/blogs', label: 'Blogs', icon: '📝' },
  { path: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
  { path: '/admin/memberships', label: 'Memberships', icon: '👑' },
  { path: '/admin/faqs', label: 'FAQs', icon: '❓' },
  { path: '/admin/coupons', label: 'Coupons', icon: '🎫' },
  { path: '/admin/giftcards', label: 'Gift Cards', icon: '🎁' },
  { path: '/admin/appointments', label: 'Appointments', icon: '📅' },
  { path: '/admin/orders', label: 'Orders', icon: '🛒' },
  { path: '/admin/contacts', label: 'Contacts', icon: '📧' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminApi.post('/admin/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 border-r border-white/10 bg-neutral-900
          transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h1 className="font-display text-2xl">NOIR</h1>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-noir-gold">Admin</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-noir-gold"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-100px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-noir-gold/10 text-noir-gold border-l-2 border-noir-gold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 bg-white/10 border border-white/10 backdrop-blur-sm hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
          >
            <span className="text-lg">🚪</span>
            <span className="tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white hover:text-noir-gold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm uppercase tracking-[0.2em] text-noir-muted">Admin Portal</h2>
            <div className="text-sm text-noir-muted">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
