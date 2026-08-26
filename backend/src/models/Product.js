import mongoose from 'mongoose';
import { generateUniqueSlug } from '../utils/slugify.js';

export const PRODUCT_TYPES = [
  'Commercial',
  'Residential',
  'Window',
  'Fire Hose & Cabinets',
  'Accessories',
  'Others',
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    slug: { type: String, unique: true, index: true },
    productType: { type: String, enum: PRODUCT_TYPES, default: 'Residential' },
    startPrice: { type: String, default: '' },
    startPriceWritten: { type: String, default: '' },
    pricePerSqft: { type: Number, default: 0 },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: String, default: '' },
    images: {
      main: { type: String, default: '' },
      pic1: { type: String, default: '' },
      pic2: { type: String, default: '' },
      pic3: { type: String, default: '' },
      pic4: { type: String, default: '' },
      pic5: { type: String, default: '' },
      pic6: { type: String, default: '' },
      pic7: { type: String, default: '' },
      pic8: { type: String, default: '' },
      pic9: { type: String, default: '' },
      pic10: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

productSchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = await generateUniqueSlug(this.name);
  }
  next();
});

productSchema.index({ name: 'text' });

export default mongoose.model('Product', productSchema);
