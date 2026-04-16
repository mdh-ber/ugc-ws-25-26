import express from "express";
import {
  getTrainings,
  createTraining,
  getTrainingById,
  updateTraining,
  deleteTraining,
} from "../controllers/trainingController.js";

import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Public
router.get("/", getTrainings);
router.get("/:id", getTrainingById);

// Protected
router.post("/", checkRole, createTraining);
router.put("/:id", checkRole, updateTraining);
router.delete("/:id", checkRole, deleteTraining);

export default router;
