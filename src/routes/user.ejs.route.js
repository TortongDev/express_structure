import { Router } from 'express';
import { showUser, showRegister, register } from '../controllers/user.controller.js';

const router = Router();

router.get('/', showUser);              // GET  /users
router.get('/register', showRegister); // GET  /users/register
router.post('/register', register);    // POST /users/register
export default router;
