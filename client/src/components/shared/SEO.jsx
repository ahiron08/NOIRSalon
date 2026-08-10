import { Helmet } from 'react-helmet-async';
import { config } from '../../config.js';

export default function SEO({ title, description = 'NOIR SALON — East India\'s Largest Luxury Salon.', path = '/' }) {
  const base = config.clientUrl || (window.location && window.location.origin) || '';
  const url = base + path;
  return (
    <Helmet>
      <title>{title ? `${title} — NOIR` : 'NOIR SALON — Luxury Beauty Brand'}</title>
      <link rel="canonical" href={url} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title ? `${title} — NOIR` : 'NOIR SALON'} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
