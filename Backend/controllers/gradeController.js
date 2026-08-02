const Grade = require("../models/Grade");

const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().sort({ createdAt: -1 });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createGrade = async (req, res) => {
  try {
    const grade = await Grade.create(req.body);
    res.status(201).json(grade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getGrades, createGrade };
