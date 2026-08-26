import { Router } from 'express';
import { orderPaymentCallback } from '../controllers/order.controller.js';
import { demandOrderPaymentCallback } from '../controllers/demandOrder.controller.js';

const router = Router();

// Matches the original's CSRF-exempt callback views (Razorpay posts back
// directly from the browser after the checkout widget completes).
router.post('/orders/callback', orderPaymentCallback);
router.post('/demand-orders/callback', demandOrderPaymentCallback);

export default router;
