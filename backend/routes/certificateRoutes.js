const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");

// GET all certificates
router.get("/", async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE certificate
router.post("/", async (req, res) => {
  try {
    const { title, issueDate, issuer, domain, type } = req.body;

    const cert = await Certificate.create({
      title,
      issueDate,
      issuer,
      domain,
      type,
    });

    res.status(201).json(cert); // ✅ return created cert
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE certificate
router.put("/:id", async (req, res) => {
  try {
    const updated = await Certificate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Certificate not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE certificate
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Certificate.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Certificate not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;