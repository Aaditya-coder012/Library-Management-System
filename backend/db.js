// db.js — MongoDB connection via Mongoose
require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      "MongoDB connection URI is missing! Please set MONGODB_URI (or MONGO_URI) in your environment variables or .env file."
    );
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    throw err;
  }
}

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection disconnected");
});

module.exports = { connectDB, mongoose };
