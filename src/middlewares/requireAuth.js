/**
 * requireAuth — REST API routes (Public API /api/v1/*)
 *
 * Reads access token from Authorization header: "Bearer <token>"
 * On success: attaches req.user and calls next().
 * On missing/invalid/expired: returns 401 JSON — no redirects.
 */

import { verifyAccessToken } from '../lib/jwt.js';

export default function requireAuth(req, res, next) {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
