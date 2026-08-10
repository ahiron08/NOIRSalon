import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import Cursor from '../Cursor.jsx';


export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Cursor />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

