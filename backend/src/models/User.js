import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    // Only set for accounts created via the admin password-login path
    // (see auth.controller.js adminLogin / utils/seed.js) - customer accounts
    // are Google-OAuth-only and never have a password.
    passwordHash: { type: String, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
