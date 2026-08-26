import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Creates/updates the one admin account that can use the password-login
// path (POST /api/auth/admin-login). Run with `npm run seed` after setting
// BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in backend/.env.
async function seed() {
  if (!env.bootstrapAdminEmail || !env.bootstrapAdminPassword) {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in backend/.env before seeding.');
  }

  await connectDB();

  const email = env.bootstrapAdminEmail.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(env.bootstrapAdminPassword, 12);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'admin', passwordHash }, $setOnInsert: { email, name: 'Admin' } },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready: ${user.email} (role: ${user.role})`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
