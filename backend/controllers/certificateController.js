const Certificate = require("../models/Certificate");

// ===== GET ALL CERTIFICATES =====
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (err) {
    console.error("Get certificates error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== GET CERTIFICATE BY ID =====
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.json(certificate);
  } catch (err) {
    console.error("Get certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== CREATE CERTIFICATE =====
exports.createCertificate = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Certificate name is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    const newCertificate = new Certificate({ name, description });
    await newCertificate.save();

    res.status(201).json(newCertificate);
  } catch (err) {
    console.error("Create certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== UPDATE CERTIFICATE =====
exports.updateCertificate = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Certificate name is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json(certificate);
  } catch (err) {
    console.error("Update certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== DELETE CERTIFICATE =====
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({ message: "Certificate deleted successfully" });
  } catch (err) {
    console.error("Delete certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
