import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};