import { Router } from 'express';
import { listDeliveryCharges } from '../controllers/deliveryCharge.controller.js';

const router = Router();

router.get('/', listDeliveryCharges);

export default router;
