import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';
import { BookButton } from '../components/Buttons.jsx';

export default function ServiceDetails() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/v1/content/services/by-slug/' + slug);
      const json = await res.json();
      setService(json.data);
    })();
  }, [slug]);

  if (!service) return <div className="min-h-screen bg-black" />;

  return (
    <>
      <PageHeader title={service.name} subtitle="Service Details" />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] w-full bg-neutral-900" />
          <div>
            <h3 className="font-display text-3xl text-white">{service.name}</h3>
            <p className="mt-3 text-noir-muted">{service.description}</p>
            <div className="mt-6 flex items-center gap-6">
              <div><span className="text-noir-gold">₹{service.offerPrice || service.price}</span>{service.offerPrice && <span className="ml-2 text-noir-muted line-through">₹{service.price}</span>}</div>
              <div className="text-sm text-noir-muted">{service.duration} minutes</div>
            </div>
            {service.benefits?.length && (
              <ul className="mt-6 space-y-2 text-sm text-noir-muted">
                {service.benefits.map((b) => <li key={b} className="flex items-center gap-3"><span className="h-px w-6 bg-noir-gold/70" />{b}</li>)}
              </ul>
            )}
            <div className="mt-8"><BookButton label="Book This Service" href="/reservations" /></div>
          </div>
        </div>
      </Section>
    </>
  );
}
