/**
 * redis.js — Redis client
 *
 * รองรับ 2 รูปแบบผ่าน environment variables:
 *
 * 1. แบบแยก (Remote / Managed Redis):
 *    REDIS_URL=redis://user:password@host:6379/0
 *    หรือ TLS:
 *    REDIS_URL=rediss://user:password@host:6380/0
 *
 * 2. แบบรวมโปรเจกต์ (localhost):
 *    REDIS_HOST=127.0.0.1
 *    REDIS_PORT=6379
 *    REDIS_PASSWORD=          ← ว่างได้ถ้าไม่ตั้ง password
 *    REDIS_DB=0
 *
 * REDIS_URL มี priority สูงกว่า — ถ้า set ไว้จะใช้ก่อนเสมอ
 *
 * Usage:
 *   import redis from './lib/redis.js';
 *   await redis.set('key', 'value', 'EX', 60);
 *   const val = await redis.get('key');
 */

import Redis from 'ioredis';
function createClient() {
  const url      = process.env.REDIS_URL;
  const host     = process.env.REDIS_HOST     || '127.0.0.1';
  const port     = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const db       = parseInt(process.env.REDIS_DB   || '0',    10);

  const sharedOptions = {
    maxRetriesPerRequest: 3,
    enableReadyCheck:     true,
    lazyConnect:          false,
    retryStrategy(times) {
      if (times > 5) {
        console.error('[Redis] Gave up reconnecting after 5 attempts');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000); // delay ms
    },
  };
  console.log(url);
  
  if (url) {
    // แบบแยก — REDIS_URL (รองรับ redis:// และ rediss://)
    console.log(`[Redis] Connecting via REDIS_URL (${url.replace(/\/\/.*@/, '//<credentials>@')})`);
    return new Redis(url, sharedOptions);
  }

  // แบบรวมโปรเจกต์ — localhost config
  console.log(`[Redis] Connecting to ${host}:${port} db=${db}`);
  return new Redis({ host, port, password, db, ...sharedOptions });
}

const redis = createClient();

redis.on('connect',   ()    => console.log('[Redis] Connected'));
redis.on('ready',     ()    => console.log('[Redis] Ready'));
redis.on('error',     (err) => console.error('[Redis] Error:', err.message));
redis.on('close',     ()    => console.warn('[Redis] Connection closed'));
redis.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

export default redis;
