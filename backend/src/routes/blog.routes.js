import { Router } from 'express';
import { listBlogs, getBlogBySlug } from '../controllers/blog.controller.js';

const router = Router();

router.get('/', listBlogs);
router.get('/:slug', getBlogBySlug);

export default router;
