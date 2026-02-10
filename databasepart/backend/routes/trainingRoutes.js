const express = require("express");
const router = express.Router();
const Training = require("../models/Training");


// ✅ Get all trainings
router.get("/", async (req, res) => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Get single training by ID
router.get("/:id", async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json(training);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Create new training
router.post("/", async (req, res) => {
  try {
    const training = new Training(req.body);
    await training.save();
    res.status(201).json(training);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ✅ Update training
router.put("/:id", async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(training);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ✅ Delete training
router.delete("/:id", async (req, res) => {
  try {
    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: "Training deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
