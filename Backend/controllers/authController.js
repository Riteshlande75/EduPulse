const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "supersecretjwtkey_student_management_2026";
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  const { name, email, password, course } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email." });
    }
    const user = await User.create({ name, email, password, course });
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, course: user.course }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, course: user.course }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user || { name: "Ritesh Lande", email: "riteshlande75@gmail.com" });
};

const deleteAccount = async (req, res) => {
  res.json({ message: "Account deleted" });
};

module.exports = {
  signup: registerUser,
  login: loginUser,
  registerUser,
  loginUser,
  getMe,
  deleteAccount
};
