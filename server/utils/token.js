import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/** Sign a JWT for a given id (user or admin). */
export function signToken(id) {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/** Verify a token — returns payload or throws. */
export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/** Build the httpOnly cookie options used for auth persistence. */
export function cookieOptions() {
  const secure = config.env === 'production';
  return {
    expires: new Date(Date.now() + config.jwt.cookieExpiresIn),
    httpOnly: true,
    secure,
    // In production the frontend (Vercel) and the API (Render) are separate
    // origins, so the auth cookie must be sent on cross-site requests. That
    // requires SameSite=None (which in turn requires `Secure`, both already
    // handled here). In dev everything is same-origin, so Lax is fine.
    sameSite: secure ? 'none' : 'lax',
  };
}
