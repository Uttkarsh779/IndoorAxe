import { Router } from 'express';
import { adminListOrders, adminUpdateOrderStatus } from '../../controllers/order.controller.js';

const router = Router();

router.get('/', adminListOrders);
router.patch('/:id/status', adminUpdateOrderStatus);

export default router;
