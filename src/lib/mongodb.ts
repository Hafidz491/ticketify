import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticketify';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  isConnected: boolean;
  lastAttempt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isConnected: false,
  lastAttempt: 0,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<{ isConnected: boolean }> {
  if (cached.conn && cached.isConnected) {
    return { isConnected: true };
  }

  // If connection previously failed, don't block subsequent requests with a 2-second timeout
  // Cooldown for 30 seconds before attempting to connect to MongoDB again
  if (!cached.isConnected && cached.lastAttempt > 0 && Date.now() - cached.lastAttempt < 30000) {
    return { isConnected: false };
  }

  if (!cached.promise) {
    cached.lastAttempt = Date.now();
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 800, // Quick timeout so fallback engages in <1s
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached.isConnected = true;
        return m;
      })
      .catch((err) => {
        cached.isConnected = false;
        cached.promise = null;
        cached.lastAttempt = Date.now();
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return { isConnected: Boolean(cached.conn && cached.isConnected) };
  } catch {
    cached.isConnected = false;
    cached.lastAttempt = Date.now();
    return { isConnected: false };
  }
}

export default connectToDatabase;
