import mongoose from "mongoose";

const MONOGODB_URL = process.env.MONGODB_URL;

if (!MONOGODB_URL) {
  throw new Error("Check your MongoDB URL 😿");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
}