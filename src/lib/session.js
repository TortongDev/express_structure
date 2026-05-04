/**
 * session.js — Express session middleware backed by Redis
 *
 * ใช้ ioredis client ที่มีอยู่แล้ว (src/lib/redis.js) — ไม่ต้อง connect-redis
 * ทำ custom store เบาๆ ที่ wrap ioredis ให้ตรงกับ express-session interface
 *
 * rolling: true  → ยืด TTL ทุก request ตราบที่ user ยังใช้งาน
 * resave: false  → ไม่ save session ถ้า session ไม่ได้ถูกแก้
 * saveUninitialized: false → ไม่สร้าง session จนกว่าจะ login
 *
 * ENV:
 *   SESSION_SECRET=<random-string>   ← ต้อง set ใน production
 *   SESSION_TTL_HOURS=2              ← optional, default 2 ชั่วโมง
 */

import session from 'express-session';
import redis   from './redis.js';

const IS_PROD = process.env.NODE_ENV === 'production';

const SESSION_TTL_SEC = parseInt(process.env.SESSION_TTL_HOURS || '2', 10) * 60 * 60;

// ── Custom Redis store using existing ioredis client ──────────────────────────
class IORedisStore extends session.Store {
  constructor({ client, prefix = 'sess:', ttl = SESSION_TTL_SEC } = {}) {
    super();
    this.client = client;
    this.prefix = prefix;
    this.defaultTTL = ttl;
  }

  _key(sid) {
    return `${this.prefix}${sid}`;
  }

  // Compute TTL from session cookie or fall back to default
  _ttl(sess) {
    if (sess?.cookie?.expires) {
      const ms = new Date(sess.cookie.expires) - Date.now();
      return Math.max(1, Math.ceil(ms / 1000));
    }
    return this.defaultTTL;
  }

  get(sid, cb) {
    this.client.get(this._key(sid))
      .then(data => cb(null, data ? JSON.parse(data) : null))
      .catch(cb);
  }

  set(sid, sess, cb) {
    this.client.set(this._key(sid), JSON.stringify(sess), 'EX', this._ttl(sess))
      .then(() => cb(null))
      .catch(cb);
  }

  destroy(sid, cb) {
    this.client.del(this._key(sid))
      .then(() => cb(null))
      .catch(cb);
  }

  // Called by express-session on every request when rolling:true
  touch(sid, sess, cb) {
    this.client.expire(this._key(sid), this._ttl(sess))
      .then(() => cb(null))
      .catch(cb);
  }
}

// ── Session middleware ─────────────────────────────────────────────────────────
export const sessionMiddleware = session({
  store:            new IORedisStore({ client: redis }),
  secret:           process.env.SESSION_SECRET || 'change-me-in-production',
  name:             'sid',               // custom name (ไม่ใช้ default 'connect.sid')
  resave:           false,
  saveUninitialized: false,
  rolling:          true,                // ยืด maxAge ทุก request
  cookie: {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: 'strict',
    maxAge:   SESSION_TTL_SEC * 1000,    // ms
  },
});
