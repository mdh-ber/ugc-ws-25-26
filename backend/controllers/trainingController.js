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