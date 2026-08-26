import DemandOrder from '../models/DemandOrder.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.service.js';
import { env } from '../config/env.js';

// Admin: mirrors admin.py Demand_ordersAdmin (search_fields: User, Email, razorpay_order_id).
export const adminListDemandOrders = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? {
        $or: [
          { userLabel: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { 'razorpay.orderId': new RegExp(search, 'i') },
        ],
      }
    : {};
  const demandOrders = await DemandOrder.find(filter).sort({ createdAt: -1 });
  res.json({ demandOrders });
});

// Ports views.payadd - the ad-hoc "pay anything" flow, no login required.
export const createDemandOrder = asyncHandler(async (req, res) => {
  const { userLabel, email, amount, remark } = req.body;
  const demandOrder = await DemandOrder.create({
    userLabel,
    email,
    amount,
    remark,
    user: req.user?._id || null,
  });
  res.status(201).json({ demandOrder });
});

// Ports views.paycheck.
export const getDemandOrderPayment = asyncHandler(async (req, res) => {
  const demandOrder = await DemandOrder.findOne({ slug: req.params.slug });
  if (!demandOrder) return res.status(404).json({ message: 'Demand order not found' });

  const razorpayOrder = await createRazorpayOrder(demandOrder.amount);
  demandOrder.razorpay.orderId = razorpayOrder.id;
  await demandOrder.save();

  res.json({ razorpayOrder, demandOrder, razorpayKeyId: env.razorpayKeyId });
});

// Ports views.success (Demand_orders variant) - now with signature verification.
export const demandOrderPaymentCallback = asyncHandler(async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;

  const demandOrder = await DemandOrder.findOne({ 'razorpay.orderId': orderId });
  if (!demandOrder) return res.status(404).json({ message: 'Demand order not found' });

  const valid = verifyRazorpaySignature({ orderId, paymentId, signature });
  if (!valid) return res.status(400).json({ message: 'Invalid payment signature' });

  demandOrder.razorpay.paymentId = paymentId;
  demandOrder.razorpay.signature = signature;
  demandOrder.razorpay.isPaid = true;
  await demandOrder.save();

  res.json({ ok: true });
});
