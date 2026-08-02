const express = require("express");
const router = express.Router();
const { getAttendance, markAttendance } = require("../controllers/attendanceController");

router.route("/").get(getAttendance).post(markAttendance);

module.exports = router;
