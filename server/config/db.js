// server/config/db.js
const mongoose = require("mongoose");

/**
 * Connect to MongoDB using MONGODB_URI environment variable.
 * Example env:
 *   MONGODB_URI=mongodb://localhost:27017/ElectroMartChatbot
 *
 * This module exports an async connectDB() function and the mongoose instance.
 */

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ElectroMartChatbot";

  if (mongoose.connection.readyState >= 1) {
    // Already connected or connecting
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // depr in newer mongoose
      // useFindAndModify: false,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
    // rethrow so server startup can decide what to do
    throw err;
  }
}

module.exports = {
  connectDB,
  mongoose,
};
