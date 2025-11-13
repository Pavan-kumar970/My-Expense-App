import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set. Starting server without database connection.');
    return;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB connection failed. Continuing without DB:', err?.message || err);
  }
}
