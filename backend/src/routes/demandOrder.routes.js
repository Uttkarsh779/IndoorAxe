import { Router } from 'express';
import { createDemandOrder, getDemandOrderPayment } from '../controllers/demandOrder.controller.js';
import { attachUserIfPresent } from '../middleware/auth.js';

const router = Router();

// Original views.payadd/paycheck have no login_required - anonymous allowed,
// but we still attach the user if a session cookie is present.
router.post('/', attachUserIfPresent, createDemandOrder);
router.get('/:slug/payment', getDemandOrderPayment);

export default router;
