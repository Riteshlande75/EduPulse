const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: String, default: "Semester 1" },
  subjects: [{
    subjectName: { type: String, required: true },
    score: { type: Number, required: true },
    grade: { type: String, required: true }
  }],
  gpa: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Grade", gradeSchema);
