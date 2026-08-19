import { Router } from 'express';
import { listMerchantProducts, listMerchants } from '../controllers/merchantController.js';

const router = Router();
router.get('/', listMerchants);
router.get('/:id/products', listMerchantProducts);

export default router;
