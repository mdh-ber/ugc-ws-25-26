const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// POST /api/reports
router.post("/generate", reportController.generateReport);
router.get("/download", reportController.downloadReportCSV);
router.get("/raw", reportController.downloadRawData);

module.exports = router;
