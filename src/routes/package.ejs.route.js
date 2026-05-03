import { Router } from 'express';
import requireSession from '../middlewares/requireSession.js';
import { showCreatePackage, ejsPostPackage, listPackages } from '../controllers/package.controller.js';

const router = Router();

router.get('/create',  requireSession, showCreatePackage);  // GET  /packages/create
router.post('/',       requireSession, ejsPostPackage);     // POST /packages
router.get('/',       listPackages);     // POST /packages

export default router;
