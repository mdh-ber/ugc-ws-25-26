const Lead = require("../models/leadModel");
const { DateTime } = require("luxon");

// =============================
// Create new lead
// =============================
exports.createLead = async (req, res) => {
  try {
    const germanyEndOfDay = DateTime
      .now()
      .setZone("Europe/Berlin")
      .set({ hour: 23, minute: 59, second: 59 });

    const newLead = new Lead({
      ...req.body,
      deadline: germanyEndOfDay.toUTC().toJSDate()
    });

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
// Count leads
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
// Chart data
// =============================
exports.getChartData = async (req, res) => {
  try {
    const data = await Lead.aggregate([
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