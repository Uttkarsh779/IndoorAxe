import { Router } from 'express';
import { listProducts, getProductBySlug } from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', listProducts);
// Original gates the product detail page behind login_required - ported exactly.
router.get('/:slug', requireAuth, getProductBySlug);

export default router;
