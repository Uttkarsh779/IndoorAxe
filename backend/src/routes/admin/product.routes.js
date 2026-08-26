import { Router } from 'express';
import { adminListProducts, createProduct, updateProduct, deleteProduct } from '../../controllers/product.controller.js';
import { uploadProductImages } from '../../middleware/upload.js';

const router = Router();

const productImageFields = ['Image', 'pic1', 'pic2', 'pic3', 'pic4', 'pic5', 'pic6', 'pic7', 'pic8', 'pic9', 'pic10'].map(
  (name) => ({ name, maxCount: 1 })
);

router.get('/', adminListProducts);
router.post('/', uploadProductImages.fields(productImageFields), createProduct);
router.put('/:id', uploadProductImages.fields(productImageFields), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
