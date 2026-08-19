import { Router } from 'express';
import { upsertUser } from '../controllers/userController.js';

const router = Router();
router.post('/upsert', upsertUser);

export default router;
