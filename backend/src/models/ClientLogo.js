import mongoose from 'mongoose';

const clientLogoSchema = new mongoose.Schema(
  {
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('ClientLogo', clientLogoSchema);
