import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Indooraxe API listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
