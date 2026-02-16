const Training = require("../models/Training");

exports.getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find();
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.addTrainings = async (req, res) => {
  try {
    const training = await Training.create(req.body);
    res.status(201).json({ message: "Training added successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    res.json(training);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
