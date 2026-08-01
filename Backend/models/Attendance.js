const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  studentName: { type: String },
  date: { type: String, required: true },
  status: { type: String, enum: ["present", "absent", "late"], required: true },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
