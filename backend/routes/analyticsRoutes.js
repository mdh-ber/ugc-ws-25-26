const express = require("express");
const router = express.Router();
const { getClicksPerCreator } = require("../controllers/analyticsController");
const auth = require("../middleware/auth");

router.get("/clicks-per-creator", auth, getClicksPerCreator);

module.exports = router;