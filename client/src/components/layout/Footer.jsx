import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaWhatsapp, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="container-noir py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* brand */}
          <div>
            <Link to="/home" className="font-display text-2xl tracking-[0.3em] text-white">
              NOIR<span className="ml-2 text-[0.55rem] uppercase tracking-[0.5em] text-noir-gold">Salon</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-noir-muted">
              East India's Largest Luxury Salon. Redefining beauty with restraint, precision, and quiet confidence.
            </p>
          </div>

          {/* quick links */}
          <div>
            <h4 className="eyebrow mb-4">Navigate</h4>
            <ul className="space-y-3 text-sm text-noir-muted">
              {['Home', 'Services', 'Products', 'Combos', 'Gallery', 'Team', 'Contact'].map((x) => (
                <li key={x}><Link to={x === 'Home' ? '/home' : `/home/${x.toLowerCase()}`} className="nav-link">{x}</Link></li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="eyebrow mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-noir-muted">
              <li className="flex items-center gap-3"><FaPhoneAlt className="text-noir-gold/80" /> +91 98765 43210</li>
              <li className="flex items-center gap-3"><FaEnvelope className="text-noir-gold/80" /> hello@noirsalon.in</li>
              <li className="flex items-center gap-3"><FaWhatsapp className="text-noir-gold/80" /> Chat on WhatsApp</li>
            </ul>
          </div>

          {/* newsletter */}
          <div>
            <h4 className="eyebrow mb-4">Newsletter</h4>
            <p className="mb-3 text-sm text-noir-muted">Rare insights. No noise.</p>
            <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); alert('Subscribed.'); }}>
              <input type="email" required placeholder="Your email" className="w-full border border-white/15 bg-transparent px-4 py-2.5 text-sm placeholder:text-noir-muted outline-none focus:border-noir-gold/60" />
              <button type="submit" className="whitespace-nowrap border border-noir-gold/60 px-4 py-2.5 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black">Join</button>
            </form>
            <div className="mt-6 flex items-center gap-4 text-noir-muted">
              <a href="https://www.instagram.com/noir.salon/" target="_blank" rel="noopener noreferrer" className="hover:text-noir-gold"><FaInstagram /></a>
              <a href="#" className="hover:text-noir-gold"><FaFacebookF /></a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6 text-center text-xs text-noir-muted">
          NOIR SALON © {new Date().getFullYear()} — Luxury Beauty Brand, Guwahati.
          <span className="mx-2">•</span>
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <span className="mx-2">•</span>
          <Link to="/terms" className="hover:text-white">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
