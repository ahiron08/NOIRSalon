import mongoose from 'mongoose';
import { config } from './index.js';

/**
 * Connects to MongoDB with a resilient, clearly-logged handshake.
 */
export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Mongo] connected → ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[Mongo] connection error:', err.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
