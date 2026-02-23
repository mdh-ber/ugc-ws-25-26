const Certificate = require("../models/Certificate");

// Create certificate (Admin/Manager or system)
exports.createCertificate = async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      issuer,
      issueDate,
      expiryDate,
      certificateUrl,
      pointsAwarded,
      incomeMade,
      milestoneId,
      rewardId,
      status,
    } = req.body;

    if (!userId || !title || !issueDate) {
      return res.status(400).json({ message: "userId, title, issueDate are required" });
    }

    const doc = await Certificate.create({
      userId,
      title,
      description,
      issuer,
      issueDate,
      expiryDate: expiryDate || null,
      certificateUrl,
      pointsAwarded: Number(pointsAwarded || 0),
      incomeMade: Number(incomeMade || 0),
      milestoneId: milestoneId || null,
      rewardId: rewardId || null,
      status: status || "active",
    });

    return res.status(201).json({ item: doc });
  } catch (err) {
    console.error("createCertificate:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Logged-in user: list my certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);

    const filter = { userId };
    const total = await Certificate.countDocuments(filter);

    const items = await Certificate.find(filter)
      .sort({ issueDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ items, total, page, limit });
  } catch (err) {
    console.error("getMyCertificates:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Logged-in user: get one certificate (must belong to user)
exports.getMyCertificateById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const item = await Certificate.findOne({ _id: id, userId });
    if (!item) return res.status(404).json({ message: "Certificate not found" });

    return res.json({ item });
  } catch (err) {
    console.error("getMyCertificateById:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: list all certificates (optional)
exports.adminListCertificates = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const userId = req.query.userId;

    const filter = userId ? { userId } : {};
    const total = await Certificate.countDocuments(filter);

    const items = await Certificate.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ items, total, page, limit });
  } catch (err) {
    console.error("adminListCertificates:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update certificate (Admin/System or owner if you allow it)
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const allowed = [
      "title",
      "description",
      "issuer",
      "issueDate",
      "expiryDate",
      "certificateUrl",
      "pointsAwarded",
      "incomeMade",
      "milestoneId",
      "rewardId",
      "status",
    ];

    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    const item = await Certificate.findByIdAndUpdate(id, patch, { new: true });
    if (!item) return res.status(404).json({ message: "Certificate not found" });

    return res.json({ item });
  } catch (err) {
    console.error("updateCertificate:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete certificate (Admin/System)
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Certificate.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: "Certificate not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteCertificate:", err);
    return res.status(500).json({ message: "Server error" });
  }
};