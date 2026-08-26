import Product from '../models/Product.js';
import Blog from '../models/Blog.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Ports views.home - unfiltered products + blogs, matching the original.
export const getHome = asyncHandler(async (req, res) => {
  const [products, blogs] = await Promise.all([Product.find(), Blog.find()]);
  res.json({ products, blogs });
});
