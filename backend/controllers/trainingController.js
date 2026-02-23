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