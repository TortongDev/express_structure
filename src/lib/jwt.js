import jwt from 'jsonwebtoken';

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env');
}

/**
 * Access token — short-lived (15 min)
 * Used by:
 *   - EJS app: stored in httpOnly cookie
 *   - API app: sent as Authorization: Bearer <token>
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

/**
 * Refresh token — long-lived (7 days)
 * Stored in httpOnly cookie + DB (RefreshToken table)
 * Used to issue new access tokens without re-login
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
