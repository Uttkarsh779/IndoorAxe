import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import productRoutes from './product.routes.js';
import blogRoutes from './blog.routes.js';
import orderRoutes from './order.routes.js';
import demandOrderRoutes from './demandOrder.routes.js';
import contactRoutes from './contact.routes.js';
import deliveryChargeRoutes from './deliveryCharge.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import clientLogoRoutes from './clientLogo.routes.js';

const router = Router();

// Every /api/admin/* route is gated exactly like Django admin's staff/superuser check.
router.use(requireAuth, requireAdmin);

router.use('/products', productRoutes);
router.use('/blogs', blogRoutes);
router.use('/orders', orderRoutes);
router.use('/demand-orders', demandOrderRoutes);
router.use('/contacts', contactRoutes);
router.use('/delivery-charges', deliveryChargeRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/client-logos', clientLogoRoutes);

export default router;
