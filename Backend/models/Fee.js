const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  course: { type: String, required: true },
  totalFee: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ["paid", "partial", "pending"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
