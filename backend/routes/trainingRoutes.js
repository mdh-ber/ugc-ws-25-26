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
