const router = require("express").Router();
const leadController = require("../controllers/leadController");

router.post("/create", leadController.createLead);
router.get("/count", leadController.countLeads);
router.get("/chart", leadController.getChartData);

module.exports = router;