const Visit = require("../models/visit");

exports.getClicksPerCreator = async (req, res) => {
  try {
    const result = await Visit.aggregate([
      {
        $group: {
          _id: "$creatorId",
          totalClicks: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "creator"
        }
      },
      { $unwind: "$creator" },
      {
        $project: {
          creatorId: "$_id",
          creatorName: "$creator.name",
          totalClicks: 1
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};