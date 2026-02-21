// routes/milestoneTypeRoutes.js
import express from "express";
import {
  createMilestoneType,
  updateMilestoneType,
  updateMilestoneGoal,
  getMilestoneTypes,
  getMilestoneTypeById,
} from "../controllers/milestoneTypeController.js";

const router = express.Router();

router.post("/", createMilestoneType);
router.get("/", getMilestoneTypes);
router.get("/:id", getMilestoneTypeById);
router.put("/:id", updateMilestoneType);
router.patch("/:id/goal", updateMilestoneGoal);

export default router;