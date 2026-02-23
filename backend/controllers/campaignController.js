const Campaign = require("../models/Campaign");

// Create
exports.createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    return res.status(201).json(campaign);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "active" }).sort({ createdAt: -1 });
    return res.json(campaigns);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json(campaign);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json(campaign);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Delete = Archive (safe for reporting)
exports.archiveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json({ message: "Campaign archived", campaign });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};