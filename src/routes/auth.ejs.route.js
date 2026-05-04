import { Router } from 'express';
import {
  showLogin,
  ejsLogin,
  ejsLogout,
  ejsRefresh,
} from '../controllers/auth.controller.js';
import { showRegister, register } from '../controllers/register.controller.js';

const router = Router();

router.get('/login',    showLogin);          // GET  /auth/login     → render login page
router.post('/login',   ejsLogin);           // POST /auth/login     → set cookies, redirect
router.post('/logout',  ejsLogout);          // POST /auth/logout    → clear cookies, redirect
router.get('/refresh',  ejsRefresh);         // GET  /auth/refresh?returnTo=/dashboard
router.get('/', showRegister);       // GET  /auth/register  → render register page
router.post('/', register);          // POST /auth/register  → create user, redirect

export default router;
