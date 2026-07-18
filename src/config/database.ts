import mongoose from "mongoose";
import { config } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("[DB] MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[DB] MongoDB disconnected");
    });
  } catch (error) {
    console.error("[DB] MongoDB connection failed:", error);
    process.exit(1);
  }
}