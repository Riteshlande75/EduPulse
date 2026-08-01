const express = require("express");
const router = express.Router();
const { getFees, createFee } = require("../controllers/feeController");

router.route("/").get(getFees).post(createFee);

module.exports = router;
