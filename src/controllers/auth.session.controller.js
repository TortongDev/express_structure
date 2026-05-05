/**
 * auth.session.controller.js — Login / Logout สำหรับ session-based EJS app
 *
 * ไม่ใช้ JWT, ไม่ใช้ refresh token — session ทั้งหมดเก็บใน Redis
 * rolling:true ใน session middleware จัดการยืด TTL ให้อัตโนมัติ
 */

import bcrypt from 'bcryptjs';
import prisma  from '../lib/prisma.js';
import { translate } from '../services/translate.service.js';

const IS_PROD = process.env.NODE_ENV === 'production';
// ── Helpers ───────────────────────────────────────────────────────────────────
function getLocale(query) {
  return ['en', 'th'].includes(query.locale) ? query.locale : 'en';
}

function safeReturnTo(raw) {
  return raw?.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
}

// ── GET /auth/login ───────────────────────────────────────────────────────────
export const showSessionLogin = (req, res) => {
  if (req.session?.user) return res.redirect('/dashboard');

  const locale   = getLocale(req.query);
  const text     = translate['login'][locale];
  const returnTo = req.query.returnTo || '';
  res.cookie('locale', locale, {
    httpOnly: true,
    secure: IS_PROD, 
    maxAge: 1000 * 60 * 60 * 24 * 30 
  });
  return res.render('login/session', { error: null, text, locale, returnTo , layout: false });
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
export const sessionLogin = async (req, res) => {
  const locale   = getLocale(req.query);
  const text     = translate['login'][locale];
  const returnTo = req.query.returnTo || '';
  console.log('start');
  
  const { username, password } = req.body;

  const renderError = (msg) =>
    res.render('login/session', { error: msg, text, locale, returnTo, layout: false });

  if (!username || !password) {
    return renderError('กรุณากรอกข้อมูลให้ครบ');
  }

  // ดึง user และตรวจ password (ทำพร้อมกันไม่ได้เพราะต้องการ hash ก่อน)
  const user = await prisma.user.findUnique({ where: { username } }).catch(() => null);
  console.log(user);
  
  // Constant-time comparison เพื่อป้องกัน timing attack
  const valid = user
    ? await bcrypt.compare(password, user.password_hash).catch(() => false)
    : false;

  if (!user || !valid) {
    return renderError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  // บันทึก login event
  await prisma.userLogin.create({ data: { user_id: user.id } }).catch(() => {});

  // สร้าง session — express-session จะ save ลง Redis อัตโนมัติ
  req.session.user = { id: user.id, username: user.username, role: user.role };

  return res.redirect(safeReturnTo(returnTo));
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
export const sessionLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('[Session] Destroy error:', err);
    res.clearCookie('sid');
    return res.redirect('/auth/login');
  });
};
