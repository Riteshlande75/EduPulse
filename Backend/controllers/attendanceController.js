const Attendance = require("../models/Attendance");

const getAttendance = async (req, res) => {
  try {
    const query = req.query.date ? { date: req.query.date } : {};
    const records = await Attendance.find(query);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const record = await Attendance.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getAttendance, markAttendance };
