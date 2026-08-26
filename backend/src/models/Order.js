import mongoose from 'mongoose';
import { generateUniqueSlug } from '../utils/slugify.js';

export const ORDER_STATUSES = ['Received Order', 'Shipped', 'Delivering', 'Delivered'];

const razorpaySubSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addon: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    qty: { type: Number, default: 0 },
    length: { type: Number, default: 0 },
    breadth: { type: Number, default: 0 },
    pricePerSqftSnapshot: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    logistic: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    statePriceSnapshot: { type: Number, default: 0 },
    address: { type: String, default: '' },
    pincode: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    remark: { type: String, default: '' },
    call: { type: String, default: '' },
    email: { type: String, default: '' },
    orderDate: { type: String, default: '' },
    slug: { type: String, unique: true, index: true },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'Received Order' },
    razorpay: { type: razorpaySubSchema, default: () => ({}) },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.slug) {
    this.slug = await generateUniqueSlug(`order-${this._id}`);
  }
  next();
});

export default mongoose.model('Order', orderSchema);
