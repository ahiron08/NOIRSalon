import mongoose from 'mongoose';

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from environment');
  }
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`[Mongo] connected → ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

export async function disconnectFromDatabase() {
  await mongoose.disconnect();
}
