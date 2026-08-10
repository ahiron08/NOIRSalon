const inDev = import.meta.env.DEV;
// Production backend origin + API prefix (Render). The Vercel frontend and the
// Render backend are separate origins, so an unset VITE_API_URL must resolve to
// the deployed backend origin WITH its /api/v1 prefix — never a same-origin
// relative path (that would hit Vercel, not the API). Keep the URL out of the
// page components: everything reads these two fields.
const PROD_API_URL = 'https://noirsalon-wu1z.onrender.com/api/v1';
const PROD_CLIENT_URL = 'https://noir-salon-client.vercel.app';

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || (inDev ? '/api/v1' : PROD_API_URL),
  clientUrl: import.meta.env.VITE_CLIENT_URL || (inDev ? 'http://localhost:3000' : PROD_CLIENT_URL),
  paymentProvider: import.meta.env.VITE_PAYMENT_PROVIDER || 'cash',
  // The admin API lives on the same Render backend origin. Keep withCredentials
  // so the httpOnly `adminToken` cookie set by /admin/login is exchanged. In dev
  // it points straight at the Express server (bypassing the Vite proxy).
  adminApiUrl:
    import.meta.env.VITE_ADMIN_API_URL || (inDev ? 'http://localhost:5000/api/v1' : PROD_API_URL),
};
