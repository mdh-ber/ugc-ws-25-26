const express = require("express");
const router = express.Router();
const controller = require("../controllers/referralVisitController");

router.get("/track/:code", controller.trackVisit);
router.get("/analytics", controller.getUniqueAudience);

module.exports = router;