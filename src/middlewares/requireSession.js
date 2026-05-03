/**
 * requireSession — EJS / server-side rendered routes (backoffice staff)
 *
 * Reads access token from httpOnly cookie `access_token`.
 * On success: attaches `req.user` and calls next().
 * On expired: redirects to /auth/refresh?returnTo=<current_path> for silent refresh.
 * On missing/invalid: redirects to /auth/login.
 */

import { verifyAccessToken } from '../lib/jwt.js';

export default function requireSession(req, res, next) {
  const token = req.cookies?.access_token;

  if (!token) {
    // No access token — check if refresh token exists for silent refresh
    const hasRefresh = !!req.cookies?.refresh_token;
    if (hasRefresh) {
      const returnTo = encodeURIComponent(req.originalUrl);
      return res.redirect(`/auth/refresh?returnTo=${returnTo}`);
    }
    return res.redirect('/auth/login');
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      // Silently refresh — browser still has refresh_token cookie
      const returnTo = encodeURIComponent(req.originalUrl);
      return res.redirect(`/auth/refresh?returnTo=${returnTo}`);
    }
    // Tampered token — force full re-login
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return res.redirect('/auth/login');
  }
}
