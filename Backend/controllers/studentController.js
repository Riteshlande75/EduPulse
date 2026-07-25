const mongoose = require("mongoose");
const Student = require("../models/Student");

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create new student
// @route   POST /students
exports.createStudent = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: "Database is not connected" });
    }
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all students
// @route   GET /students
exports.getStudents = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: "Database is not connected" });
    }
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single student by ID
// @route   GET /students/:id
exports.getStudentById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: "Database is not connected" });
    }
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update student by ID
// @route   PUT /students/:id
exports.updateStudent = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: "Database is not connected" });
    }
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete student by ID
// @route   DELETE /students/:id
exports.deleteStudent = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: "Database is not connected" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "Student record removed successfully" });
    }

    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
