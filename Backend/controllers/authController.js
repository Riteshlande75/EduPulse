const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper: generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// @desc    Register / Signup new student
// @route   POST /auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (isDbConnected()) {
      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }

      // Create User (password auto-hashed via pre-save hook in User model)
      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        course: course || "Computer Science",
      });

      const savedUser = await user.save();

      // Also create corresponding Student entry if not already in Student collection
      const existingStudent = await Student.findOne({ email: email.toLowerCase() });
      if (!existingStudent) {
        const newStudent = new Student({
          name,
          email: email.toLowerCase(),
          course: course || "Computer Science",
          enrollmentDate: new Date().toISOString().split("T")[0],
          status: "active",
        });
        await newStudent.save();
      }

      const token = generateToken(savedUser._id);

      res.status(201).json({
        message: "Account created successfully!",
        token,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          course: savedUser.course,
          role: savedUser.role,
        },
      });
    } else {
      // Fallback offline user signup
      res.status(201).json({
        message: "Account created in local session mode!",
        token: null,
        user: {
          id: "local_" + Date.now(),
          name,
          email: email.toLowerCase(),
          course: course || "Computer Science",
          role: "student",
        },
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to register student." });
  }
};

// @desc    Login student
// @route   POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password." });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Use bcrypt comparePassword method
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const token = generateToken(user._id);

      res.json({
        message: "Login successful!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          course: user.course,
          role: user.role,
        },
      });
    } else {
      // Offline mode login support
      res.json({
        message: "Logged in (Local Session Mode)",
        token: null,
        user: {
          id: "local_user",
          name: email.split("@")[0],
          email: email.toLowerCase(),
          course: "Computer Science",
          role: "student",
        },
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to log in." });
  }
};

// @desc    Get current user profile (protected)
// @route   GET /auth/me
exports.getMe = async (req, res) => {
  res.json({
    status: "Auth service online",
    user: req.user || null,
  });
};

// @desc    Delete account — removes user from DB, immediately invalidating their JWT
// @route   DELETE /auth/account
exports.deleteAccount = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: "Database not connected. Cannot delete account." });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please sign in first." });
    }

    // Delete the user from DB — this immediately invalidates any existing JWT for them
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json({ message: "Account deleted successfully. Your session has been cleared." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete account." });
  }
};
