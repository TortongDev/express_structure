import { Router } from 'express';
import internalOnly from '../../../middlewares/internalOnly.js';

const router = Router();

// All routes here are protected by internalOnly middleware
// Mount internal route groups here:
// import authRouter from './auth.route.js';
// router.use('/auth', authRouter);

router.get('/health', internalOnly, (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
