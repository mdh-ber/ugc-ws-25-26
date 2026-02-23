const express = require("express");
const router = express.Router();
const controller = require("../controllers/referralVisitController");

// clicks per creator endpoint
router.get("/clicks-per-creator", controller.getClicksPerCreator);

module.exports = router;