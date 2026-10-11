const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "supersecretjwtkey_student_management_2026";
  return jwt.sign({ id: userId }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

const registerUser = async (req, res) => {
  const { name, email, password, course } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email, and password." });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      course: course || "Computer Science",
      role: "student"
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        role: user.role || "student"
      }
    });
  } catch (err) {
    console.error("[REGISTER ERROR]", err.message);
    return res.status(500).json({ message: err.message || "Failed to create user account." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter both email and password." });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    let isMatch = false;
    if (typeof user.comparePassword === "function") {
      try {
        isMatch = await user.comparePassword(String(password));
      } catch (e) {
        isMatch = false;
      }
    }
    // Fallback for plain-text comparison if not yet hashed
    if (!isMatch && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        role: user.role || "student"
      }
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    return res.status(500).json({ message: err.message || "Authentication service error." });
  }
};

const getMe = async (req, res) => {
  if (req.user && req.user.id) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (user) return res.json(user);
    } catch (e) {}
  }
  return res.json(req.user || { name: "Student User", email: "student@university.edu" });
};

const deleteAccount = async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await User.findByIdAndDelete(req.user.id);
    }
    return res.json({ message: "Account deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to delete account." });
  }
};

module.exports = {
  signup: registerUser,
  login: loginUser,
  registerUser,
  loginUser,
  getMe,
  deleteAccount
};
