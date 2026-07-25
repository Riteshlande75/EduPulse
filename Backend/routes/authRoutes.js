const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { signup, login, getMe, deleteAccount } = require("../controllers/authController");
const requireAuth = require("../middleware/requireAuth");

// Rate limiter for auth routes: max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts from this device. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, getMe);

// Delete account — requires valid JWT; once user is deleted, token is instantly invalidated
router.delete("/account", requireAuth, deleteAccount);

module.exports = router;
