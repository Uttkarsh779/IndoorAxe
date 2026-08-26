import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    call: { type: String, trim: true, default: '' },
    question: { type: String, default: '' },
    // true for submissions coming from the landing-page lead form, which
    // reuses this same collection in the original app (see API_MAPPING.md)
    source: { type: String, enum: ['contact', 'landing'], default: 'contact' },
  },
  { timestamps: true }
);

contactSchema.index({ name: 'text', email: 'text', call: 'text', question: 'text' });

export default mongoose.model('Contact', contactSchema);
