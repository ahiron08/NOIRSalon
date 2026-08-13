import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoClose } from 'react-icons/io5';
import { FaShoppingBag } from 'react-icons/fa';
import { Magnetic } from './Buttons.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const EASE = [0.22, 1, 0.36, 1];

const NAV_LINKS = [
  { name: 'Home', path: '/home' },
  { name: 'Services', path: '/home/services' },
  { name: 'Products', path: '/home/products' },
  { name: 'Combos', path: '/home/combos' },
  { name: 'Gallery', path: '/home/gallery' },
  { name: 'About', path: '/home/about' },
  { name: 'Team', path: '/home/team' },
  { name: 'Contact', path: '/home/contact' },
];

export default function Navbar({ visible = true }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={visible ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'border-b border-white/[0.06] bg-black/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-black/50 to-transparent'
        }`}
      >
        <div className="container-noir flex h-20 items-center justify-between md:h-24">
          {/* logo */}
          <Link to="/home" data-cursor className="font-display text-2xl tracking-[0.3em] text-white transition-colors duration-500 hover:text-noir-gold">
            NOIR
            <span className="ml-2 align-middle text-[0.55rem] font-sans uppercase tracking-[0.5em] text-noir-gold">
              Salon
            </span>
          </Link>

          {/* desktop menu */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                data-cursor 
                className={`nav-link ${isActive(link.path) ? 'text-noir-gold' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* book now + mobile toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              data-cursor
              aria-label="View cart"
              className="relative flex h-11 w-11 items-center justify-center border border-white/15 text-white transition-colors duration-500 hover:border-noir-gold hover:text-noir-gold"
            >
              <FaShoppingBag className="text-base" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-noir-gold px-1 text-[0.6rem] font-bold text-black">
                  {count}
                </span>
              )}
            </Link>

            <Magnetic strength={0.25} className="hidden md:inline-block">
              <Link
                to="/reservations"
                data-cursor
                className="group relative inline-flex items-center justify-center overflow-hidden border border-noir-gold/60 px-6 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-noir-gold transition-all duration-500 hover:bg-noir-gold hover:text-black"
              >
                <span className="relative z-10">Book Now</span>
              </Link>
            </Magnetic>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              data-cursor
              aria-label="Toggle menu"
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-white transition-colors duration-500 hover:border-noir-gold hover:text-noir-gold lg:hidden"
            >
              {open ? <IoClose className="text-xl" /> : <GiHamburgerMenu className="text-lg" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-black/95 px-8 backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 28 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: EASE }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setOpen(false)}
                    data-cursor
                    className={`font-display text-4xl transition-colors duration-500 hover:text-noir-gold ${isActive(link.path) ? 'text-noir-gold' : 'text-white'}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 28 }}
                transition={{ delay: 0.1 + NAV_LINKS.length * 0.06, duration: 0.6, ease: EASE }}
                className="mt-4"
              >
                <Link
                  to="/reservations"
                  onClick={() => setOpen(false)}
                  data-cursor
                  className="inline-flex w-max items-center border border-noir-gold/60 px-8 py-3.5 text-xs uppercase tracking-[0.3em] text-noir-gold hover:bg-noir-gold hover:text-black"
                >
                  Book Now
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
