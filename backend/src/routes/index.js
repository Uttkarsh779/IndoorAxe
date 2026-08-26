import { Router } from 'express';
import homeRoutes from './home.routes.js';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import blogRoutes from './blog.routes.js';
import contactRoutes from './contact.routes.js';
import leadRoutes from './lead.routes.js';
import deliveryChargeRoutes from './deliveryCharge.routes.js';
import orderRoutes from './order.routes.js';
import demandOrderRoutes from './demandOrder.routes.js';
import paymentRoutes from './payment.routes.js';
import adminRoutes from './admin/index.js';

const router = Router();

router.use('/home', homeRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/blogs', blogRoutes);
router.use('/contacts', contactRoutes);
router.use('/leads', leadRoutes);
router.use('/delivery-charges', deliveryChargeRoutes);
router.use('/orders', orderRoutes);
router.use('/demand-orders', demandOrderRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

export default router;
