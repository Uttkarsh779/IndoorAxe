import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Node's built-in resolver sometimes fails SRV lookups for mongodb+srv://
// URIs on Windows even when the OS itself resolves them fine (a known
// Node/Windows DNS quirk, not an Atlas problem) - pointing it at public
// resolvers fixes it without needing any OS-level DNS changes.
dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);

export async function connectDB() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
}
