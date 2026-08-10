const inDev = import.meta.env.DEV;
// In production the built SPA is served from the same origin as the API, so any
// unset URLs resolve to the current window origin. This keeps localhost-only
// defaults out of deployed builds (nothing is hardcoded to a specific host).
const origin =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : '';

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',
  clientUrl: import.meta.env.VITE_CLIENT_URL || (inDev ? 'http://localhost:3000' : origin),
  paymentProvider: import.meta.env.VITE_PAYMENT_PROVIDER || 'cash',
  // The admin API is baked to the backend origin (not the Vite proxy) so the
  // httpOnly `adminToken` cookie set by /admin/login is sent correctly. In dev
  // we need the explicit Vite-served origin; in production the SPA and API are
  // served together, so a relative path reaches the same origin and the cookie
  // is sent automatically.
  adminApiUrl:
    import.meta.env.VITE_ADMIN_API_URL || (inDev ? 'http://localhost:5000/api/v1' : '/api/v1'),
};
