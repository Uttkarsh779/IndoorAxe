import { Router } from 'express';
import {
  createOrder,
  getOrder,
  updateOrderBilling,
  getOrderPayment,
  orderPaymentCallback,
  getOrderBill,
  getOrderQuote,
  listMyOrders,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/mine', requireAuth, listMyOrders);

router.post('/from-product/:slug', requireAuth, createOrder);
router.get('/:slug', requireAuth, getOrder);
router.patch('/:slug/billing', requireAuth, updateOrderBilling);
router.get('/:slug/payment', requireAuth, getOrderPayment);
router.patch('/:slug/payment', requireAuth, getOrderPayment);
router.get('/:slug/bill', requireAuth, getOrderBill);
router.get('/:slug/quote', requireAuth, getOrderQuote);

export default router;
