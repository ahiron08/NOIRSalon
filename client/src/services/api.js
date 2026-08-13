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
    const e = new Error(msg);
    e.status = err.response?.status;
    return Promise.reject(e);
  }
);

export default api;

/**
 * fetch wrapper that targets the configured API base (config.apiUrl) and only
 * parses JSON when the response is actually JSON. A 404/HTML error page is
 * turned into a useful Error instead of causing the
 * "Unexpected token 'T', "The page c"... is not valid JSON" crash.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(config.apiUrl + path, options);
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message ? ` — ${body.message}` : '';
    } catch {
      // Non-JSON (HTML/text) error body; keep the status-based message.
    }
    throw new Error(`API request failed: ${res.status}${detail}`);
  }
  return res.json();
}

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
    const e = new Error(msg);
    e.status = err.response?.status;
    return Promise.reject(e);
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

/*
 * Order API — reuses the configured `api` (user) / `adminApi` (admin) instances
 * so auth conventions and interceptors stay consistent. All handlers resolve to
 * the inner `data` payload.
 */
export const ordersApi = {
  create(payload) {
    // resolves to the full body { success, intent, payment, data: order }
    return api.post('/orders', payload).then((r) => r);
  },
  mine() {
    return api.get('/orders/mine').then((r) => r.data);
  },
  getOne(id) {
    return api.get(`/orders/mine/${id}`).then((r) => r.data);
  },
  paymentInfo(id, sessionId) {
    return api
      .get(`/orders/payment/${id}`, { params: sessionId ? { sessionId } : {} })
      .then((r) => r.data);
  },
  paymentStatus(id, sessionId) {
    return api
      .get(`/orders/payment/${id}/status`, { params: sessionId ? { sessionId } : {} })
      .then((r) => r.data);
  },
};

/*
 * Reservation / appointment API (customer-side).
 */
export const reservationsApi = {
  mine() {
    return api.get('/appointments/mine').then((r) => r.data);
  },
  getOne(id) {
    return api.get(`/appointments/mine/${id}`).then((r) => r.data);
  },
  cancel(id) {
    return api.patch(`/appointments/mine/${id}/cancel`).then((r) => r.data);
  },
  /**
   * Bookable start times for a stylist + service on a date.
   * Resolves to the availability payload (duration, availableSlots, …).
   */
  availability(params) {
    return api.get('/appointments/availability', { params }).then((r) => r.data);
  },
  /** Create a reservation. Resolves to the full body { success, data }.
   *  Rejects with .status === 409 on a booking collision. */
  book(payload) {
    return api.post('/appointments/book', payload).then((r) => r);
  },
};

/*
 * Admin order/reservation API — routed through `adminApi` (adminToken cookie).
 */
export const adminOrdersApi = {
  all() {
    return adminApi.get('/admin/orders').then((r) => r.data);
  },
  updateStatus(id, status) {
    return adminApi.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data);
  },
  markPayment(id, paymentStatus) {
    return adminApi.patch(`/admin/orders/${id}/payment`, { paymentStatus }).then((r) => r.data);
  },
};

export const adminReservationsApi = {
  all() {
    return adminApi.get('/admin/appointments').then((r) => r.data);
  },
  getOne(id) {
    return adminApi.get(`/admin/appointments/${id}`).then((r) => r.data);
  },
  updateStatus(id, status, extra = {}) {
    return adminApi.patch(`/admin/appointments/${id}/status`, { status, ...extra }).then((r) => r.data);
  },
  update(id, payload) {
    return adminApi.patch(`/admin/appointments/${id}`, payload).then((r) => r.data);
  },
};


