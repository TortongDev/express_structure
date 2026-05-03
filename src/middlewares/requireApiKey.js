/**
 * requireApiKey — Public API routes called by third-party systems
 *
 * Reads API key from X-Api-Key header.
 * Key is stored as SHA-256 hash in DB — raw key is never stored.
 *
 * Third-party call example:
 *   GET /api/v1/menu
 *   X-Api-Key: cafei_live_xxxxxxxxxxxxxxxxxxxx
 *
 * On success: attaches req.apiClient (ApiKey record) and calls next().
 * On missing/invalid/inactive/expired: returns 401 JSON.
 *
 * Key format: cafei_live_<32 random hex chars>
 * Key generation: use scripts/generate-api-key.js
 */

import crypto from 'crypto';
import prisma  from '../lib/prisma.js';

/**
 * Hash a raw API key with SHA-256 before DB lookup.
 * Raw key is never stored — only the hash is in DB.
 */
function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export default async function requireApiKey(req, res, next) {
  const raw = req.headers['x-api-key'];

  if (!raw || typeof raw !== 'string') {
    return res.status(401).json({ error: 'Missing X-Api-Key header' });
  }

  // Basic format check — cafei_live_ prefix
  if (!raw.startsWith('cafei_live_') && !raw.startsWith('cafei_test_')) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }

  const hashed = hashKey(raw);

  let record;
  try {
    record = await prisma.apiKey.findUnique({ where: { key: hashed } });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (!record) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (!record.is_active) {
    return res.status(401).json({ error: 'API key is inactive' });
  }

  if (record.expires_at && record.expires_at < new Date()) {
    return res.status(401).json({ error: 'API key has expired' });
  }

  // Update last_used_at asynchronously — don't block the request
  prisma.apiKey.update({
    where: { id: record.id },
    data:  { last_used_at: new Date() },
  }).catch(() => {});

  // Attach client info for controllers to use
  req.apiClient = {
    id:   record.id,
    name: record.name,
  };

  next();
}
