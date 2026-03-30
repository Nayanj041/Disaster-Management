import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDb Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDb connection failed:", error.message);
    throw error;
  }
};
