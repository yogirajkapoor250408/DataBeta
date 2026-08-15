import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/databeta';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${MONGODB_URI}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB] Connection notice: ${error?.message || error}. Running in resilient local mode.`);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
