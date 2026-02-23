const express = require("express");
const {
  getTrainings,
  createTraining,
  getTrainingById,
  updateTraining,
  deleteTraining,
} = require("../controllers/trainingController.js");

const checkRole = require("../middleware/checkRole.js");

const router = express.Router();

// Public
router.get("/", getTrainings);
router.get("/:id", getTrainingById);

// Protected
router.post("/", checkRole, createTraining);
router.put("/:id", checkRole, updateTraining);
router.delete("/:id", checkRole, deleteTraining);

module.exports = router;