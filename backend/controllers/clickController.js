const Click = require("../models/Click");

// Log a new click event
exports.logClick = async (req, res) => {
  try {
    const click = await Click.create(req.body);
    res.status(201).json({ message: "Click logged successfully", click });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get click statistics with filtering
exports.getClickStats = async (req, res) => {
  try {
    const { startDate, endDate, resourceType, trainingId } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        // Include the entire end date by setting time to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = endDateTime;
      }
    }
    
    if (resourceType) {
      filter.resourceType = resourceType;
    }
    
    if (trainingId) {
      filter.trainingId = trainingId;
    }

    // Aggregate clicks by day
    const clicksByDay = await Click.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      }
    ]);

    // Get total clicks
    const totalClicks = await Click.countDocuments(filter);

    // Get clicks by resource type
    const clicksByType = await Click.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$resourceType",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1
        }
      }
    ]);

    res.json({
      totalClicks,
      clicksByDay,
      clicksByType
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all clicks (with optional filtering)
exports.getClicks = async (req, res) => {
  try {
    const { startDate, endDate, resourceType, limit = 100 } = req.query;
    
    const filter = {};
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        // Include the entire end date by setting time to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = endDateTime;
      }
    }
    
    if (resourceType) {
      filter.resourceType = resourceType;
    }

    const clicks = await Click.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('trainingId', 'title type');
    
    res.json(clicks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
