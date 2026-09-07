import mongoose from "mongoose";

export async function Connection() {
  try {
    if (!process.env.MONO_DB) {
      throw new Error("MONOS_URL is not configured");
    }
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    await mongoose.connect(process.env.MONO_DB);
    console.log("Mongoose connected");
  } catch (error) {
    console.log("Somthing went wrong connection error", error);
    throw error;
  }
}
