const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  subject: { type: String, required: true },
  phone: { type: String },
  officeHours: { type: String, default: "Mon-Fri 10:00 AM - 4:00 PM" }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
