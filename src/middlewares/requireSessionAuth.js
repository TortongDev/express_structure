/**
 * requireSessionAuth — EJS / server-side rendered routes (session-based)
 *
 * ตรวจ req.session.user ที่ express-session populate ให้
 * On success: attaches req.user and calls next()
 * On missing: redirects to /auth/login?returnTo=<current_path>
 */

export default function requireSessionAuth(req, res, next) {
  if (!req.session?.user) {
    const returnTo = encodeURIComponent(req.originalUrl);
    return res.redirect(`/auth/login?returnTo=${returnTo}`);
  }
  req.user = req.session.user;
  next();
}
