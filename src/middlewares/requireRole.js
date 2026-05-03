/**
 * requireRole — role-based access control (works with both middlewares above)
 *
 * Usage:
 *   router.get('/admin', requireSession, requireRole('ADMIN'), handler)
 *   router.get('/api/admin', requireApiAuth, requireRole('ADMIN'), handler)
 */

export default function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      // For EJS routes, return 403 page; for API, return 403 JSON
      const isApi = req.path.startsWith('/api') || req.headers['accept']?.includes('application/json');
      if (isApi) {
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }
      return res.status(403).render('error', { message: 'Access denied' });
    }

    next();
  };
}
