// Import mongoose
import mongoose from "mongoose";

// Import and configure dotenv
import * as dotenv from "dotenv";
dotenv.config();

// Get the MongoDB URI from environment variables or use a default value
const DB_CONNECTION = process.env.MONGODB_URI || "mongodb+srv://truongnguyenptn:123456789A@cluster0.qb6iquw.mongodb.net/myDatabaseName?retryWrites=true&w=majority&appName=Cluster0";

// Initialize and connect to the database
export const init = async () => {
  try {
    // Avoid reconnecting if already connected
    if (mongoose.connection.readyState === mongoose.STATES.connected) {
      console.log("Already connected to MongoDB");
      return;
    }

    // Connect to the database
    await mongoose.connect(DB_CONNECTION);

    console.log("MongoDB database connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
