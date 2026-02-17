// routes/userMilestoneRoutes.js
import express from "express";
import {
  assignMilestone,
  updateProgress,
  getUserMilestones,
  getUserMilestoneById,
} from "../controllers/userMilestoneController.js";

const router = express.Router();

router.post("/", assignMilestone);
router.get("/:creatorId", getUserMilestones);
router.get("/detail/:id", getUserMilestoneById);
router.patch("/:id/progress", updateProgress);

export default router;
``