import mongoose from 'mongoose';

const deliveryChargeSchema = new mongoose.Schema(
  {
    state: { type: String, trim: true, required: true, unique: true },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('DeliveryCharge', deliveryChargeSchema);
