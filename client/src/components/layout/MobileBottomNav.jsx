import { Link } from 'react-router-dom';
import { FaHome, FaGem, FaImages, FaUsers, FaEnvelope } from 'react-icons/fa';

const items = [
  { to: '/', icon: FaHome },
  { to: '/services', icon: FaGem },
  { to: '/gallery', icon: FaImages },
  { to: '/team', icon: FaUsers },
  { to: '/contact', icon: FaEnvelope },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-1 flex-col items-center gap-1 py-3 text-noir-muted hover:text-noir-gold">
            <Icon className="text-lg" />
            <span className="text-[0.6rem] uppercase tracking-widest">{to.replace('/', '').toUpperCase()}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
