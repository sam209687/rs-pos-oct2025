// src/lib/db.ts
import mongoose from "mongoose";

let cachedDb: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI as string);
    cachedDb = db;
    console.log("Connected to MongoDB.");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
    throw new Error("Failed to connect to database.");
  }
}