import { Router } from 'express';
import {
  showSessionLogin,
  sessionLogin,
  sessionLogout,
} from '../controllers/auth.session.controller.js';

const router = Router();

router.get('/login',   showSessionLogin);   // GET  /auth/login  → render login
router.post('/login',  sessionLogin);        // POST /auth/login  → create session, redirect
router.post('/logout', sessionLogout);       // POST /auth/logout → destroy session, redirect

export default router;
