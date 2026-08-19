import { Router } from 'express';
import { createPayment, paynowResult } from '../controllers/paymentController.js';

const router = Router();
router.post('/orders/:orderId', createPayment);
router.post('/paynow/result', paynowResult);

export default router;