/**
 * ejs-session.js — EJS app ที่ใช้ Redis session แทน JWT cookie
 *
 * การทำงาน:
 *   - express-session + Redis store จัดการ session ทั้งหมด
 *   - rolling: true → TTL ยืดทุก request (ไม่ logout ตราบที่ยังใช้งาน)
 *   - ไม่มี JWT, ไม่มี refresh token
 *   - session ID ส่งผ่าน httpOnly cookie ชื่อ 'sid'
 *
 * Port: EJS_SESSION_PORT (ตั้งใน .env)
 */

import express          from 'express';
import { sessionMiddleware } from './lib/session.js';
import requireSessionAuth    from './middlewares/requireSessionAuth.js';
import authSessionRoute      from './routes/auth.session.route.js';

const EJS_SESSION_APP = express();

EJS_SESSION_APP.set('view engine', 'ejs');
EJS_SESSION_APP.set('views', './src/views');
EJS_SESSION_APP.use(express.urlencoded({ extended: true }));

// ── Session middleware (Redis store, rolling TTL) ──────────────────────────────
EJS_SESSION_APP.use(sessionMiddleware);

// ── Auth routes (public — no session required) ─────────────────────────────────
EJS_SESSION_APP.use('/auth', authSessionRoute);

// ── Protected routes (session required) ───────────────────────────────────────
EJS_SESSION_APP.get('/', requireSessionAuth, (req, res) => res.redirect('/dashboard'));

EJS_SESSION_APP.get('/dashboard', requireSessionAuth, (req, res) => {
  res.render('dashboard/index', { user: req.user });
});

// เพิ่ม protected routes ได้ที่นี่ เช่น:
// EJS_SESSION_APP.use('/package', requireSessionAuth, packageRoute);
// EJS_SESSION_APP.use('/admin',   requireSessionAuth, requireRole('ADMIN'), adminRoute);

export default EJS_SESSION_APP;
