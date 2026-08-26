import Product from '../models/Product.js';
import DeliveryCharge from '../models/DeliveryCharge.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { publicUrlFor } from '../middleware/upload.js';

const IMAGE_FIELDS = ['main', 'pic1', 'pic2', 'pic3', 'pic4', 'pic5', 'pic6', 'pic7', 'pic8', 'pic9', 'pic10'];

export const listProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.productType = req.query.type;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ products });
});

// Admin: mirrors admin.py ProductAdmin (search_fields: Name).
export const adminListProducts = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search ? { name: new RegExp(search, 'i') } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ products });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const [deliveryCharges, relatedProducts] = await Promise.all([
    DeliveryCharge.find().sort({ state: 1 }),
    Product.find({ productType: 'Accessories' }),
  ]);
  res.json({ product, deliveryCharges, relatedProducts });
});

export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;
  const images = {};
  IMAGE_FIELDS.forEach((field) => {
    const multerField = field === 'main' ? 'Image' : field;
    const file = req.files?.[multerField]?.[0];
    if (file) images[field] = publicUrlFor('Product', file.filename);
  });

  const product = await Product.create({
    name: body.name,
    productType: body.productType,
    startPrice: body.startPrice,
    startPriceWritten: body.startPriceWritten,
    pricePerSqft: body.pricePerSqft,
    seoDescription: body.seoDescription,
    seoKeywords: body.seoKeywords,
    images,
  });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const body = req.body;
  ['name', 'productType', 'startPrice', 'startPriceWritten', 'pricePerSqft', 'seoDescription', 'seoKeywords'].forEach(
    (field) => {
      if (body[field] !== undefined) product[field] = body[field];
    }
  );

  IMAGE_FIELDS.forEach((field) => {
    const multerField = field === 'main' ? 'Image' : field;
    const file = req.files?.[multerField]?.[0];
    if (file) product.images[field] = publicUrlFor('Product', file.filename);
  });

  await product.save();
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.status(204).send();
});
