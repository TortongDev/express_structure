import { Router } from 'express';
import { register } from '../../../controllers/register.controller.js';

const router = Router();

router.post('/register', register);   // POST /api/v1/auth/register

export default router;
