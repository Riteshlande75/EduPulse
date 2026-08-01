const express = require("express");
const router = express.Router();
const { getGrades, createGrade } = require("../controllers/gradeController");

router.route("/").get(getGrades).post(createGrade);

module.exports = router;
