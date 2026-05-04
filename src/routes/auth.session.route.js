import { Router } from 'express';
import {
  showSessionLogin,
  sessionLogin,
  sessionLogout,
} from '../controllers/auth.session.controller.js';
import { showRegister, register } from '../controllers/register.controller.js';

const router = Router();

router.get('/login',    showSessionLogin);   // GET  /auth/login     → render login
router.post('/login',   sessionLogin);        // POST /auth/login     → create session, redirect
router.post('/logout',  sessionLogout);       // POST /auth/logout    → destroy session, redirect
router.get('/register', showRegister);        // GET  /auth/register  → render register page
router.post('/register', register);           // POST /auth/register  → create user, redirect

export default router;
