const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");

// Middleware to verify JWT + confirm user still exists in DB
const requireAuth = async (req, res, next) => {
  // Allow read operations without auth
  if (req.method === "GET") return next();

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required. Please sign in to continue." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Step 1: Verify the JWT signature & expiry
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error. Please contact support." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 2: Check if the user still exists in the database
    // If account was deleted, the token is immediately invalidated
    const userExists = await User.findById(decoded.id).select("_id");
    if (!userExists) {
      return res.status(401).json({
        message: "Account no longer exists. Please sign up again.",
        code: "USER_DELETED"
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }
    return res.status(401).json({ message: "Invalid token. Please sign in again." });
  }
};

module.exports = requireAuth;
