<<<<<<< HEAD
// backend/controllers/trainingController.js
import Training from "../models/Training.js";

// GET /api/trainings
export const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });
    return res.json(trainings);
  } catch (err) {
    console.error("getTrainings error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// POST /api/trainings
export const createTraining = async (req, res) => {
  try {
    const training = await Training.create(req.body);
    return res.status(201).json(training);
  } catch (err) {
    console.error("createTraining error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// GET /api/trainings/:id
export const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });
    return res.json(training);
  } catch (err) {
    console.error("getTrainingById error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// PUT /api/trainings/:id
export const updateTraining = async (req, res) => {
  try {
    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Training not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateTraining error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// DELETE /api/trainings/:id
export const deleteTraining = async (req, res) => {
  try {
    const deleted = await Training.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Training not found" });
    return res.json({ message: "Training deleted" });
  } catch (err) {
    console.error("deleteTraining error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
=======
const Training = require("../models/Training");

exports.getTrainings = async (req, res) => {
  try {  
   
    const trainings = await Training.Training.find();  
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.addTrainings = async (req, res) => {
  try {
    const training = await Training.Training.create(req.body);
    res.status(201).json({ message: "Training added successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTrainingById = async (req, res) => {
  try {
    const training = await Training.Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    res.json(training);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    res.json({ message: "Training updated successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.Training.findByIdAndDelete(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    res.json({ message: "Training deleted successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};  
/*
exports.getTrainingSchedules = async (req, res) => {
  try {  
   
    const trainings = await Training.TrainingSchedule.find();  
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTrainingScheduleById = async (req, res) => {
  try {  
   
    const training = await Training.TrainingSchedule.findById(req.params.id);  
    res.json(training);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.addTrainingSchedules = async (req, res) => {
  try {
    const training = await Training.TrainingSchedule.create(req.body);
    res.status(201).json({ message: "Training added successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTrainingSchedules = async (req, res) => {
  try {
    const training = await Training.TrainingSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Training updated successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTrainingSchedules = async (req, res) => {
  try {
    const training = await Training.TrainingSchedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Training deleted successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

*/
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
