import mongoose from 'mongoose';
import { generateUniqueSlug } from '../utils/slugify.js';

const razorpaySubSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
  },
  { _id: false }
);

const demandOrderSchema = new mongoose.Schema(
  {
    // Ad-hoc "pay anything" flow (views.payadd) has no login_required in the
    // original, so the submitter may or may not be authenticated. `user` is
    // populated only when the requester has a session; `userLabel` always
    // keeps the raw name typed into the form, matching the original which
    // never linked this to a real account.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userLabel: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    remark: { type: String, default: '' },
    call: { type: String, default: '' },
    email: { type: String, default: '' },
    orderDate: { type: String, default: '' },
    slug: { type: String, unique: true, index: true },
    razorpay: { type: razorpaySubSchema, default: () => ({}) },
  },
  { timestamps: true }
);

demandOrderSchema.pre('save', async function (next) {
  if (!this.slug) {
    this.slug = await generateUniqueSlug(this.userLabel || `demand-${this._id}`);
  }
  next();
});

export default mongoose.model('DemandOrder', demandOrderSchema);
