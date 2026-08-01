const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

router.get("/", getStudents);
router.get("/:id", getStudentById);

// Protected mutation routes (requires login)
router.post("/", requireAuth, createStudent);
router.put("/:id", requireAuth, updateStudent);
router.delete("/:id", requireAuth, deleteStudent);

module.exports = router;
