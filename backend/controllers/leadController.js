const Lead = require("../models/lead");

// =============================
// Create new lead
// =============================
exports.createLead = async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: newLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// Count leads (with filter)
// =============================
exports.countLeads = async (req, res) => {
  try {
    const { source } = req.query;

    let filter = {};
    if (source) filter.source = source;

    const totalLeads = await Lead.countDocuments(filter);

    res.status(200).json({
      success: true,
      totalLeads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// Chart data (group by source)
// =============================
exports.getChartData = async (req, res) => {
  try {
    const { source } = req.query;

    let filter = {};
    if (source) filter.source = source;

    const data = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$source",
          total: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};