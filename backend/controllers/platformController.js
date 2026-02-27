const Platform = require("../models/Platform");
const fs = require("fs");
const path = require("path");

// GET all custom platforms
exports.getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ createdAt: -1 });
    return res.json(platforms);
  } catch (err) {
    console.error("getPlatforms error:", err);
    return res.status(500).json({ message: "Failed to fetch platforms" });
  }
};

// POST a new platform
exports.createPlatform = async (req, res) => {
  try {
    const { name } = req.body;
    let iconPath = "";

    // Handle the uploaded image
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
      const uploadDir = path.join(__dirname, "../uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
      iconPath = `/uploads/${filename}`;
    } else {
      return res.status(400).json({ message: "Icon image is required." });
    }

    const created = await Platform.create({ name, icon: iconPath });
    return res.status(201).json(created);
  } catch (err) {
    console.error("createPlatform error:", err);
    return res.status(500).json({ message: "Failed to create platform" });
  }
};

// PUT (Edit) an existing platform
exports.updatePlatform = async (req, res) => {
  try {
    const updateData = { name: req.body.name };

    // If they uploaded a NEW image while editing, save it!
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
      const uploadDir = path.join(__dirname, "../uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
      updateData.icon = `/uploads/${filename}`;
    }

    const updated = await Platform.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Platform not found" });
    
    return res.json(updated);
  } catch (err) {
    console.error("updatePlatform error:", err);
    return res.status(500).json({ message: "Failed to update platform" });
  }
};

// DELETE a platform
exports.deletePlatform = async (req, res) => {
  try {
    const deleted = await Platform.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Platform not found" });
    return res.json({ message: "Platform deleted" });
  } catch (err) {
    console.error("deletePlatform error:", err);
    return res.status(500).json({ message: "Failed to delete platform" });
  }
};