import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateOrderPricing } from '../services/pricing.service.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.service.js';
import { env } from '../config/env.js';

async function populateOrder(query) {
  return query.populate('product').populate('addon').populate('user', 'email name');
}

// Ports views.orderform (product.html estimator form submit).
export const createOrder = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { qty, length, breadth, orderDate, statePrice, addonId } = req.body;

  let addon = null;
  let addonPricePerSqft = 0;
  if (addonId) {
    addon = await Product.findById(addonId);
    if (addon) addonPricePerSqft = addon.pricePerSqft;
  }

  const pricing = calculateOrderPricing({
    length,
    breadth,
    qty,
    pricePerSqft: product.pricePerSqft,
    addonPricePerSqft,
    statePrice,
  });

  const order = await Order.create({
    user: req.user._id,
    product: product._id,
    addon: addon?._id || null,
    qty,
    length,
    breadth,
    pricePerSqftSnapshot: product.pricePerSqft,
    // matches the original's `total = (productCost + addonCost) + gst`
    total: pricing.total + pricing.addonCost + pricing.gst,
    gst: pricing.gst,
    logistic: pricing.logistic,
    amount: pricing.amount,
    statePriceSnapshot: Number(statePrice) || 0,
    orderDate: orderDate || '',
  });

  res.status(201).json({ order });
});

// Ports views.booking GET.
export const getOrder = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findOne({ slug: req.params.slug }));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});

// Ports views.booking POST - fixed to update the existing order in place
// (the original created a second, unrelated blank Order row here - confirmed
// with the user as an unintended bug, not a feature to replicate).
export const updateOrderBilling = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ slug: req.params.slug });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const { email, call, address, pincode, city, state, remark } = req.body;
  if (email !== undefined) order.email = email;
  if (call !== undefined) order.call = call;
  if (address !== undefined) order.address = address;
  if (pincode !== undefined) order.pincode = pincode;
  if (city !== undefined) order.city = city;
  if (state !== undefined) order.state = state;
  if (remark !== undefined) order.remark = remark;

  await order.save();
  res.json({ order });
});

// Ports views.payment GET+POST (Razorpay order creation + optional contact update).
export const getOrderPayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ slug: req.params.slug });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const { email, call, address, remark } = req.body || {};
  if (email !== undefined) order.email = email;
  if (call !== undefined) order.call = call;
  if (address !== undefined) order.address = address;
  if (remark !== undefined) order.remark = remark;

  const razorpayOrder = await createRazorpayOrder(order.amount);
  order.razorpay.orderId = razorpayOrder.id;
  await order.save();

  res.json({ razorpayOrder, order, razorpayKeyId: env.razorpayKeyId });
});

// Ports views.paysuccess (Order variant) - now with signature verification.
export const orderPaymentCallback = asyncHandler(async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;

  const order = await Order.findOne({ 'razorpay.orderId': orderId });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const valid = verifyRazorpaySignature({ orderId, paymentId, signature });
  if (!valid) return res.status(400).json({ message: 'Invalid payment signature' });

  order.razorpay.paymentId = paymentId;
  order.razorpay.signature = signature;
  order.razorpay.isPaid = true;
  await order.save();

  res.json({ ok: true });
});

// Ports views.show - order bill with GST/CGST/SGST split.
export const getOrderBill = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findOne({ slug: req.params.slug }));
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const pricing = calculateOrderPricing({
    length: order.length,
    breadth: order.breadth,
    qty: order.qty,
    pricePerSqft: order.product?.pricePerSqft ?? order.pricePerSqftSnapshot,
    addonPricePerSqft: order.addon?.pricePerSqft ?? 0,
    statePrice: order.statePriceSnapshot,
  });

  res.json({ order, gst: pricing.gst, csgst: pricing.csgst });
});

// Ports views.quote - same as bill but also returns addon cost + total.
export const getOrderQuote = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findOne({ slug: req.params.slug }));
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const pricing = calculateOrderPricing({
    length: order.length,
    breadth: order.breadth,
    qty: order.qty,
    pricePerSqft: order.product?.pricePerSqft ?? order.pricePerSqftSnapshot,
    addonPricePerSqft: order.addon?.pricePerSqft ?? 0,
    statePrice: order.statePriceSnapshot,
  });

  res.json({ order, gst: pricing.gst, csgst: pricing.csgst, addonCost: pricing.addonCost, total: pricing.total });
});

// Ports views.dash - the logged-in user's own orders.
export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await populateOrder(Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  res.json({ orders });
});

// Admin: mirrors admin.py OrderAdmin (search_fields: User, Email, razorpay_order_id).
export const adminListOrders = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? { $or: [{ email: new RegExp(search, 'i') }, { 'razorpay.orderId': new RegExp(search, 'i') }] }
    : {};
  const orders = await populateOrder(Order.find(filter).sort({ createdAt: -1 }));
  res.json({ orders });
});

export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});
