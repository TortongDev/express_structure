import { Router } from 'express';
import requireSession from '../middlewares/requireSession.js';
import { showCreatePackage, ejsPostPackage, listPackages } from '../controllers/package.controller.js';

const router = Router();

router.get('/',  requireSession, showCreatePackage);  // GET  /packages/create
router.post('/',       requireSession, ejsPostPackage);     // POST /packages
router.get('/list_packages',       listPackages);     // POST /packages

export default router;
