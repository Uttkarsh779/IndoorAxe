import DeliveryCharge from '../models/DeliveryCharge.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const listDeliveryCharges = asyncHandler(async (req, res) => {
  const deliveryCharges = await DeliveryCharge.find().sort({ state: 1 });
  res.json({ deliveryCharges });
});

export const createDeliveryCharge = asyncHandler(async (req, res) => {
  const { state, price } = req.body;
  const deliveryCharge = await DeliveryCharge.create({ state, price });
  res.status(201).json({ deliveryCharge });
});

export const updateDeliveryCharge = asyncHandler(async (req, res) => {
  const deliveryCharge = await DeliveryCharge.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!deliveryCharge) return res.status(404).json({ message: 'Delivery charge not found' });
  res.json({ deliveryCharge });
});

export const deleteDeliveryCharge = asyncHandler(async (req, res) => {
  const deliveryCharge = await DeliveryCharge.findByIdAndDelete(req.params.id);
  if (!deliveryCharge) return res.status(404).json({ message: 'Delivery charge not found' });
  res.status(204).send();
});
