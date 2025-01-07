import mongoose from "mongoose";

const MONOGODB_URL = process.env.MONGODB_URL!;

if (!MONOGODB_URL) {
  throw new Error("Check your MongoDB URL 😿");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

//! Connect to MongoDB 🚤
export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONOGODB_URL, opts).then(() => {
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("Connected to MongoDB 🚀");
    console.log("Database Name: ", cached?.conn?.db?.databaseName);
  } catch (error) {
    cached.promise = null;
    console.error("Error connecting to MongoDB: 😢 💢", error);
  }

  return cached.conn;
}
