const express = require("express");
const router = express.Router();

const reviewRequestController = require("../controllers/reviewRequestController");

router.post("/", reviewRequestController.createReviewRequest);
router.get("/", reviewRequestController.getAllReviewRequests);
router.get("/:id", reviewRequestController.getReviewRequestById);
router.patch("/:id/status", reviewRequestController.updateReviewRequestStatus);

module.exports = router;

