<<<<<<< HEAD
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
=======
const express = require("express");
const router = express.Router();
const { getTrainings, addTrainings, getTrainingById, updateTraining, deleteTraining
   /* ,getTrainingSchedules, getTrainingScheduleById ,addTrainingSchedules, updateTrainingSchedules, deleteTrainingSchedules */
   } = require("../controllers/trainingController");

// Training routes
router.get("/", getTrainings);
router.get("/:id", getTrainingById);
router.post("/", addTrainings);
router.put("/:id", updateTraining);
router.delete("/:id", deleteTraining);

/*
// Training Schedule routes 
router.get("/schedules", getTrainingSchedules);
router.get("/schedules/:id", getTrainingScheduleById);
router.post("/schedules", addTrainingSchedules);
router.put("/schedules/:id", updateTrainingSchedules);
router.delete("/schedules/:id", deleteTrainingSchedules);
*/
module.exports = router;
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
