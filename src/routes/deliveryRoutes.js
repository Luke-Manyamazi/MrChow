import { Router } from 'express';
import { assignDelivery, updateDelivery } from '../controllers/deliveryController.js';
import { requireRole } from '../middleware/errorHandler.js';

const router = Router();
router.post('/orders/:orderId/assign', requireRole('ADMIN'), assignDelivery);
router.patch('/orders/:orderId/status', requireRole('DRIVER', 'ADMIN'), updateDelivery);

export default router;