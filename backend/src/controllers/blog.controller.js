import Blog from '../models/Blog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicUrlFor } from '../middleware/upload.js';

// The original blogs.html template lists every blogger row with no status
// filter (confirmed with the user to replicate exactly) - inactive/draft
// posts remain publicly visible, matching current live behavior.
export const listBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ createdOn: -1 });
  res.json({ blogs });
});

// Admin: mirrors admin.py bloggerAdmin (search_fields: title, list_display incl. Status_article).
export const adminListBlogs = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const filter = {};
  if (search) filter.title = new RegExp(search, 'i');
  if (status) filter.statusArticle = status;
  const blogs = await Blog.find(filter).sort({ createdOn: -1 });
  res.json({ blogs });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json({ blog });
});

export const createBlog = asyncHandler(async (req, res) => {
  const body = req.body;
  const thumbnail = req.files?.thumbnail?.[0];
  const banner = req.files?.banner?.[0];

  const blog = await Blog.create({
    title: body.title,
    statusArticle: body.statusArticle,
    createdOn: body.createdOn ? new Date(body.createdOn) : new Date(),
    thumbnail: thumbnail ? publicUrlFor('blog/thumbnail', thumbnail.filename) : '',
    banner: banner ? publicUrlFor('blog/Banner', banner.filename) : '',
    seoDescription: body.seoDescription,
    seoKeywords: body.seoKeywords,
    content: body.content,
  });
  res.status(201).json({ blog });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });

  const body = req.body;
  ['title', 'statusArticle', 'seoDescription', 'seoKeywords', 'content'].forEach((field) => {
    if (body[field] !== undefined) blog[field] = body[field];
  });
  if (body.createdOn) blog.createdOn = new Date(body.createdOn);

  const thumbnail = req.files?.thumbnail?.[0];
  const banner = req.files?.banner?.[0];
  if (thumbnail) blog.thumbnail = publicUrlFor('blog/thumbnail', thumbnail.filename);
  if (banner) blog.banner = publicUrlFor('blog/Banner', banner.filename);

  await blog.save();
  res.json({ blog });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.status(204).send();
});
