/**
 * internalOnly — Server-to-server routes (called by customer webapp server)
 *
 * Reads secret from X-Internal-Secret header.
 * Must match INTERNAL_API_SECRET env variable.
 *
 * Customer webapp call example:
 *   GET /api/internal/menu
 *   X-Internal-Secret: <INTERNAL_API_SECRET>
 *
 * Security layers:
 *   1. This middleware validates the secret
 *   2. Nginx blocks /api/internal/* from public internet (only VPS-internal allowed)
 *   3. Secret rotated via env — no DB needed
 */

const SECRET = process.env.INTERNAL_API_SECRET;

if (!SECRET) {
  throw new Error('INTERNAL_API_SECRET is not set in environment variables');
}

export default function internalOnly(req, res, next) {
  const provided = req.headers['x-internal-secret'];

  // Timing-safe comparison to prevent timing attacks
  if (!provided || provided.length !== SECRET.length) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Compare char by char — same length guaranteed above
  let mismatch = 0;
  for (let i = 0; i < SECRET.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ SECRET.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}
