// backend/controllers/trainingController.js
const Training = require("../models/Training");
const { sendJson,readJsonBody } = require("../utils/responseHelpers");

// Controller function to handle GET /api/trainings
async function getTrainings(req, res) {
  try {
    const items = await Training.find().sort({ createdAt: -1 }).lean();
    return sendJson(res, 200, items);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return sendJson(res, 500, { message: error.message || "Server error" });
  }
}

// Controller function to handle POST /api/trainings
async function createTraining(req, res) {
  try {
    const body = await readJsonBody(req);
    const training = await Training.create(body);
    return sendJson(res, 201, training);
  } catch (error) {
    console.error("Error creating training:", error);
    return sendJson(res, 500, { message: error.message || "Server error" });
  }
}

// Controller function to handle GET /api/trainings/:id
async function getTrainingById(req, res) {
  try {
    
    const training = await Training.findById(req.params.id);
    if (!training) return sendJson(res, 404, { message: "Training not found" });
    return sendJson(res, 200, training);
  } catch (error) {
    console.error("Error fetching training by ID:", error);
    return sendJson(res, 500, { message: error.message || "Server error" });
  }
}

// Controller function to handle PUT /api/trainings/:id
async function updateTraining(req, id, res) {
  try {
    const body = await readJsonBody(req);
    const updated = await Training.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updated) return sendJson(res, 404, { message: "Training not found" });
    return sendJson(res, 200, updated);
  } catch (error) {
    console.error("Error updating training:", error);
    return sendJson(res, 500, { message: error.message || "Server error" });
  }
}

// Controller function to handle DELETE /api/trainings/:id
async function deleteTraining(req, res) {
  try {
    const id = req.params.id;
    const deleted = await Training.findByIdAndDelete(id);
    if (!deleted) return sendJson(res, 404, { message: "Training not found" });
    return sendJson(res, 200, { message: "Training deleted successfully" });
  } catch (error) {
    console.error("Error deleting training:", error);
    return sendJson(res, 500, { message: error.message || "Server error" });
  }
}

module.exports = {
  getTrainings,
  createTraining,
  getTrainingById,
  updateTraining,
  deleteTraining,
};