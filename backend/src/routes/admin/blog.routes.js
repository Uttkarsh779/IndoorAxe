import { Router } from 'express';
import { adminListBlogs, createBlog, updateBlog, deleteBlog } from '../../controllers/blog.controller.js';
import { uploadBlogImages } from '../../middleware/upload.js';

const router = Router();
const blogImageFields = uploadBlogImages.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

router.get('/', adminListBlogs);
router.post('/', blogImageFields, createBlog);
router.put('/:id', blogImageFields, updateBlog);
router.delete('/:id', deleteBlog);

export default router;
