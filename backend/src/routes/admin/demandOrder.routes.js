import { Router } from 'express';
import { adminListDemandOrders } from '../../controllers/demandOrder.controller.js';

const router = Router();

router.get('/', adminListDemandOrders);

export default router;
