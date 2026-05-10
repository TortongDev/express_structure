import { Router } from 'express';
import requireSession from '../middlewares/requireSession.js';
import { showCreatePackage, ejsPostPackage, listPackages } from '../controllers/package.controller.js';

const router = Router();

router.get('/', showCreatePackage);  // GET  /packages/create
router.post('/', ejsPostPackage);     // POST /packages
router.get('/list_packages',       listPackages);     // POST /packages

export default router;
