import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function NotFound() {
  return (
    <>
      <PageHeader title="404" subtitle="Lost?" />
      <Section>
        <div className="flex flex-col items-start gap-6">
          <h2 className="font-display text-5xl text-white">Page not found.</h2>
          <p className="text-noir-muted">The page you are looking for does not exist or has been moved.</p>
          <Link to="/home" className="border border-noir-gold/60 px-8 py-3.5 text-xs uppercase tracking-[0.28em] text-noir-gold hover:bg-noir-gold hover:text-black">Return Home</Link>
        </div>
      </Section>
    </>
  );
}
