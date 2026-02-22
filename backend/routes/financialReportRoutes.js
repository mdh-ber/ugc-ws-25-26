const express = require("express");
const router = express.Router();
const { getFinancialReport, exportFinancialReportCSV } = require("../controllers/financialReportController");

// Financial report routes
router.get("/", getFinancialReport);
router.get("/export", exportFinancialReportCSV);

module.exports = router;