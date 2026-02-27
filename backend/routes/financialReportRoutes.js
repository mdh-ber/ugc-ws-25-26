const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/financialReportController");

router.get("/compare", analyticsController.compareCampaigns);
router.get("/roi", analyticsController.spentVsROI);
router.get("/timeseries", analyticsController.timeSeries);
router.get("/cpc", analyticsController.costPerClick);
router.get("/ctr", analyticsController.clickThroughRate);

module.exports = router;