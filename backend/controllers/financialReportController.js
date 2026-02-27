const mongoose = require("mongoose");
const Earning = require("../models/Earning");// 1️⃣ Compare multiple campaigns (ROI, revenue, cost)
const compareCampaigns = async (req, res) => {
  try {
    // Fetch all earnings
    const earnings = await Earning.find({});

    // Group by campaignId
    const campaignMap = {};

    earnings.forEach(e => {
      const id = e.campaignId.toString();
      if (!campaignMap[id]) {
        campaignMap[id] = {
          campaignId: id,
          totalRevenue: 0,
          totalCost: 0,
          totalClicks: 0,
          totalImpressions: 0
        };
      }

      campaignMap[id].totalRevenue += e.revenue || 0;
      campaignMap[id].totalCost += e.cost || 0;
      campaignMap[id].totalClicks += e.clicks || 0;
      campaignMap[id].totalImpressions += e.impressions || 0;
    });

    // Compute ROI and convert map to array
    const result = Object.values(campaignMap).map(c => ({
      ...c,
      roi: c.totalCost === 0 ? 0 : ((c.totalRevenue - c.totalCost) / c.totalCost) * 100
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const spentVsROI = async (req, res) => {
  try {
    const data = await Earning.aggregate([
      {
        $group: {
          _id: "$campaignId",
          totalRevenue: { $sum: "$revenue" },
          totalCost: { $sum: "$cost" }
        }
      },
      {
        $lookup: {
          from: "campaigns", // name of campaigns collection in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "campaign"
        }
      },
      { $unwind: "$campaign" }, // Flatten the campaign array
      {
        $project: {
          _id: 0,
          campaignId: "$_id",
          campaignName: "$campaign.name",
          spent: "$totalCost",
          totalRevenue: 1,
          roi: {
            $cond: [
              { $eq: ["$totalCost", 0] },
              0,
              { $multiply: [{ $divide: [{ $subtract: ["$totalRevenue", "$totalCost"] }, "$totalCost"] }, 100] }
            ]
          }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3️⃣ Time Series (day/week/month/hour)
const timeSeries = async (req, res) => {
  try {
    const { period = "month" } = req.query; // day, week, month, hour

    const groupId = {
      day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      week: { $isoWeek: "$date" },
      month: { $dateToString: { format: "%Y-%m", date: "$date" } },
      year: { $year: "$date" },
      hour: { $hour: "$date" }
    };
    const data1 = await Earning.find({}).sort({ date: 1 }); // sorted by date ascending
    console.log("Earnings data for time series:", data1);



    const data = await Earning.aggregate([
      {
        $group: {
          _id: groupId[period],
          totalRevenue: { $sum: "$revenue" },
          totalCost: { $sum: "$cost" },
          totalClicks: { $sum: "$clicks" },
          totalImpressions: { $sum: "$impressions" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
console.log("Time series data:", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4️⃣ Cost Per Click (CPC)
const costPerClick = async (req, res) => {
  try {
    const { campaignId } = req.query;

    const match = campaignId ? { campaignId: mongoose.Types.ObjectId(campaignId) } : {};

    const data = await Earning.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$campaignId",
          totalCost: { $sum: "$cost" },
          totalClicks: { $sum: "$clicks" }
        }
      },
      {
        $project: {
          cpc: { $cond: [{ $eq: ["$totalClicks", 0] }, 0, { $divide: ["$totalCost", "$totalClicks"] }] },
          totalCost: 1,
          totalClicks: 1
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5️⃣ Click Through Rate (CTR)
const clickThroughRate = async (req, res) => {
  try {
    const { campaignId } = req.query;

    const match = campaignId ? { campaignId: mongoose.Types.ObjectId(campaignId) } : {};

    const data = await Earning.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$campaignId",
          totalClicks: { $sum: "$clicks" },
          totalImpressions: { $sum: "$impressions" }
        }
      },
      {
        $project: {
          ctr: { $cond: [{ $eq: ["$totalImpressions", 0] }, 0, { $multiply: [{ $divide: ["$totalClicks", "$totalImpressions"] }, 100] }] },
          totalClicks: 1,
          totalImpressions: 1
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  compareCampaigns,
  spentVsROI,
  timeSeries,
  costPerClick,
  clickThroughRate,
};