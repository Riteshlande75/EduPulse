const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// Load .env from Backend directory — works no matter where node is run from
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeRoutes = require("./routes/feeRoutes");

const app = express();

/* ------------------- Database Connection ------------------- */
connectDB();

/* ------------------- Middleware ------------------- */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Serve Frontend static assets
app.use(express.static(path.join(__dirname, "../Frontend")));

/* ------------------- Routes ------------------- */
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/fees", feeRoutes);

// Return JSON 404 for unhandled API requests
app.use((req, res, next) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/api") || req.path.startsWith("/students") || req.path.startsWith("/teachers") || req.path.startsWith("/attendance") || req.path.startsWith("/fees")) {
    return res.status(404).json({ message: `API endpoint ${req.method} ${req.originalUrl} not found.` });
  }
  next();
});

app.get(["/login", "/login.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/pages/login.html"));
});

app.get(["/signup", "/signup.html", "/register", "/register.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/pages/register.html"));
});

app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

/* ------------------- Error Handler ------------------- */
app.use(errorHandler);

/* ------------------- Start Server ------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});