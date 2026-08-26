import mongoose from 'mongoose';
import { generateUniqueSlug } from '../utils/slugify.js';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, unique: true, index: true },
    statusArticle: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdOn: { type: Date, required: true },
    thumbnail: { type: String, default: '' },
    banner: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: String, default: '' },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

blogSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = await generateUniqueSlug(this.title);
  }
  next();
});

blogSchema.index({ title: 'text' });

export default mongoose.model('Blog', blogSchema);
