import axios from 'axios';
import { config } from '../config.js';

export const api = axios.create({ baseURL: config.apiUrl, withCredentials: true });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token') || document.cookie.split('; ').find((c) => c.startsWith('token='))?.split('=')[1];
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Network error';
    if (err.response?.status === 401) localStorage.removeItem('token');
    return Promise.reject(new Error(msg));
  }
);

export default api;

/**
 * Admin API client — points directly at the backend origin (not the Vite proxy)
 * so the httpOnly `adminToken` cookie is sent with every request. Admin
 * authentication is cookie-based, so no token is injected into headers here.
 */
export const adminApi = axios.create({ baseURL: config.adminApiUrl, withCredentials: true });

adminApi.interceptors.response.use(
  (r) => r.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

/** Upload a file to the admin media endpoint; resolves to { url, public_id }. */
export async function uploadAdminImage(file, fieldname = 'image') {
  const formData = new FormData();
  formData.append(fieldname, file);
  const res = await adminApi.post('/admin/upload', formData);
  if (res.success && res.url) return { url: res.url, public_id: res.public_id };
  throw new Error(res.message || 'Image upload failed');
}


