// backend/controllers/certificateController.js
const Certificate = require("../models/Certificate");

// GET /api/certificates
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/certificates
exports.createCertificate = async (req, res) => {
  try {
    const { title, issueDate, issuer, domain, type } = req.body;

    const cert = await Certificate.create({
      title,
      issueDate,
      issuer,
      domain,
      type,
    });

    // IMPORTANT: return the created object so frontend can add it to table
    res.status(201).json(cert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/certificates/:id
exports.updateCertificate = async (req, res) => {
  try {
    const updated = await Certificate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Certificate not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/certificates/:id
exports.deleteCertificate = async (req, res) => {
  try {
    const deleted = await Certificate.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Certificate not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};