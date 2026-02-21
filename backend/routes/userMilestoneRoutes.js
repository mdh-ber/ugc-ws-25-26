// backend/routes/userMilestoneRoutes.js
import express from "express";
import {
  assignMilestone,
  updateProgress,
  getUserMilestones,
  getUserMilestoneById,
} from "../controllers/userMilestoneController.js";
import { awardLeaderboardWinners } from "../controllers/awardController.js"; // ← NEW

const router = express.Router();

router.post("/", assignMilestone);
router.get("/:creatorId", getUserMilestones);
router.get("/detail/:id", getUserMilestoneById);
router.patch("/:id/progress", updateProgress);

// NEW: award leaderboard winners (admin/backoffice)
router.post("/award", awardLeaderboardWinners);

export default router;