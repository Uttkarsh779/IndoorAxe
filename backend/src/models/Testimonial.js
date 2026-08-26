import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Testimonial', testimonialSchema);
