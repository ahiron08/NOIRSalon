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
    sameSite: 'lax',
  };
}
