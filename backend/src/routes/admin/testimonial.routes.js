import { Router } from 'express';
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../../controllers/testimonial.controller.js';
import { uploadTestimonialImage } from '../../middleware/upload.js';

const router = Router();

router.get('/', listTestimonials);
router.post('/', uploadTestimonialImage.single('image'), createTestimonial);
router.put('/:id', uploadTestimonialImage.single('image'), updateTestimonial);
router.delete('/:id', deleteTestimonial);

export default router;
