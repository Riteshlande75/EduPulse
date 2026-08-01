const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });


const connectDB = async () => {
  const dbUri = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/student-management";
  try {
    const conn = await mongoose.connect(dbUri);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.warn("Server will continue running. Ensure MongoDB service is running or MONGODB_URL is configured in .env");
  }
};

module.exports = connectDB;
