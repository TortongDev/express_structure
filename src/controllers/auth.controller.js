import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt.js';

// ── Cookie options ─────────────────────────────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,             // JS cannot read this cookie (XSS protection)
  secure:   IS_PROD,          // HTTPS only in production
  sameSite: 'strict',         // CSRF protection
  maxAge:   15 * 60 * 1000,   // 15 minutes
};

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure:   IS_PROD,
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  path:     '/auth/refresh',  // Cookie only sent to refresh endpoint
};

// ── Shared login logic (used by both EJS and API) ─────────────────────────────
async function performLogin(username, password) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  // Log login event
  await prisma.userLogin.create({ data: { user_id: user.id } });

  const payload = { sub: user.id, username: user.username, role: user.role };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist refresh token in DB (allows revocation)
  await prisma.refreshToken.create({
    data: { token: refreshToken, user_id: user.id },
  });

  return { user, accessToken, refreshToken };
}

// ── EJS Controller (redirects, renders) ───────────────────────────────────────
import {translate} from '../services/translate.service.js';
export const showLogin = (req, res) => {
  if (req.cookies?.access_token) return res.redirect('/dashboard');
  const {locale} = req.query;
  if(locale !== 'en' && locale !== 'th') {
    return res.redirect('/auth/login?locale=en');
  }
  console.log(translate);
  let obj_text = translate['login'];

  console.log(obj_text['th']);
  return res.render('login/index', { error: null, text: obj_text[locale], locale: locale });
};

export const ejsLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login/index', { error: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  const result = await performLogin(username, password).catch(() => null);

  if (!result) {
    return res.render('login/index', { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  res.cookie('access_token',  result.accessToken,  ACCESS_COOKIE_OPTS);
  res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTS);
  res.redirect('/dashboard');
};

export const ejsLogout = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (refreshToken) {
    // Revoke from DB
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
  }

  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/auth/refresh' });
  res.redirect('/auth/login');
};

// ── EJS Refresh (cookie-based silent refresh) ──────────────────────────────────
export const ejsRefresh = async (req, res) => {
  const token = req.cookies?.refresh_token;

  if (!token) return res.redirect('/auth/login');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return res.redirect('/auth/login');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return res.redirect('/auth/login');
  }

  const newAccess = signAccessToken({
    sub:      payload.sub,
    username: payload.username,
    role:     payload.role,
  });

  res.cookie('access_token', newAccess, ACCESS_COOKIE_OPTS);

  // Validate returnTo to prevent open redirect (must be relative path)
  const raw = req.query.returnTo || '';
  const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
  res.redirect(returnTo);
};
