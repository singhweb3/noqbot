import mongoose from "mongoose";
import { seedSuperAdmin } from "@/lib/seedSuperAdmin";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in environment variables.");
}

// Extend global type for mongoose caching
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize global cache if not defined
if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const cached = global._mongoose;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(async (m) => {
      console.log("✅ MongoDB connected");

      // 🔑 Seed Super Admin ONCE
      await seedSuperAdmin();

      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
