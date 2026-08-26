import { Router } from 'express';
import {
  listDeliveryCharges,
  createDeliveryCharge,
  updateDeliveryCharge,
  deleteDeliveryCharge,
} from '../../controllers/deliveryCharge.controller.js';

const router = Router();

router.get('/', listDeliveryCharges);
router.post('/', createDeliveryCharge);
router.put('/:id', updateDeliveryCharge);
router.delete('/:id', deleteDeliveryCharge);

export default router;
