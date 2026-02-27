const Lead = require('../models/Lead');

// Get Leads grouped by platform
exports.getLeadStats = async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 } // Count how many leads per platform
        }
      },
      { $sort: { count: -1 } } // Sort highest to lowest
    ]);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching lead stats" });
  }
};

// Create a Lead (Simulating a form submission)
exports.createLead = async (req, res) => {
  try {
    const { name, email, platform, creatorId } = req.body; // ✅ Extract creatorId
    const newLead = new Lead({ name, email, platform, creatorId });
    await newLead.save();
    res.status(201).json({ message: "Lead saved successfully", lead: newLead });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};