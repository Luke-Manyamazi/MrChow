import { Router } from 'express';
import { dashboard, listOrders, updateOrderStatus } from '../controllers/adminController.js';
import { requireRole } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireRole('ADMIN'));
router.get('/dashboard', dashboard);
router.get('/orders', listOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;