import "dotenv/config";
import mongoose from "mongoose";

const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017/tutor";

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI;
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  return mongoose.connection;
}
