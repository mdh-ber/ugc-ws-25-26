const express = require("express");
const router = express.Router();
const {
  getTrainings,
  addTrainings,
  getTrainingById,
} = require("../controllers/trainingController");

router.get("/", getTrainings);
router.post("/", addTrainings);
router.get("/:id", getTrainingById);

module.exports = router;
