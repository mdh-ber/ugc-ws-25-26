const express = require("express");
const router = express.Router();
const Platform = require("../models/Platform");

// GET all platforms
router.get("/", async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ createdAt: -1 });
    res.json(platforms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch platforms" });
  }
});

// POST new platform
router.post("/", async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !icon) return res.status(400).json({ message: "Name and icon required" });
    
    const created = await Platform.create({ name, icon });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Failed to create platform" });
  }
});

// PUT update platform
router.put("/:id", async (req, res) => {
  try {
    const updated = await Platform.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
});

// DELETE platform
router.delete("/:id", async (req, res) => {
  try {
    await Platform.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

module.exports = router;