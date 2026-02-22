const Earning = require('../models/Earning');
const Campaign = require('../models/Campaign');

exports.getFinancialReport = async (req, res) => {
  try {
    const { creator, platform, allTime } = req.query;

    let query = {};

    // Apply filters
    if (creator) {
      query.creator = new RegExp(creator, 'i');
    }
    if (platform) {
      query.platform = new RegExp(platform, 'i');
    }

    // If not allTime, filter by recent date (e.g., last 30 days)
    if (allTime !== 'true') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }

    // Get earnings with populated campaign data
    const earnings = await Earning.find(query).populate('campaignId');

    // Calculate totals and ROI for each earning
    const reportData = earnings.map(earning => ({
      _id: earning._id,
      creator: earning.creator,
      platform: earning.platform,
      revenue: earning.revenue,
      cost: earning.cost,
      roi: earning.roi,
      impressions: earning.impressions,
      engagement: earning.engagement,
      clicks: earning.clicks,
      conversions: earning.conversions,
      date: earning.date,
      campaignName: earning.campaignId ? earning.campaignId.name : 'Unknown Campaign',
      campaignBudget: earning.campaignId ? earning.campaignId.budget : 0,
      description: earning.description
    }));

    // If no data in DB, return mock data for demo
    if (reportData.length === 0) {
      let mockData = [
        { creator: 'Creator1', platform: 'Instagram', revenue: 1000, cost: 500, roi: 100, campaignName: 'Summer Campaign', impressions: 50000, engagement: 2500 },
        { creator: 'Creator2', platform: 'TikTok', revenue: 800, cost: 400, roi: 100, campaignName: 'Product Launch', impressions: 75000, engagement: 3750 },
        { creator: 'Creator1', platform: 'YouTube', revenue: 1200, cost: 600, roi: 100, campaignName: 'Brand Awareness', impressions: 100000, engagement: 5000 },
        { creator: 'Creator3', platform: 'Instagram', revenue: 900, cost: 450, roi: 100, campaignName: 'Holiday Promo', impressions: 60000, engagement: 3000 },
        { creator: 'Creator4', platform: 'TikTok', revenue: 750, cost: 375, roi: 100, campaignName: 'User Generated', impressions: 80000, engagement: 4000 },
        { creator: 'Creator2', platform: 'YouTube', revenue: 1100, cost: 550, roi: 100, campaignName: 'Influencer Collab', impressions: 90000, engagement: 4500 }
      ];

      if (creator) {
        mockData = mockData.filter(item => item.creator.toLowerCase().includes(creator.toLowerCase()));
      }
      if (platform) {
        mockData = mockData.filter(item => item.platform.toLowerCase().includes(platform.toLowerCase()));
      }

      return res.json(mockData);
    }

    res.json(reportData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportFinancialReportCSV = async (req, res) => {
  try {
    const { creator, platform, allTime } = req.query;

    let query = {};

    // Apply filters
    if (creator) {
      query.creator = new RegExp(creator, 'i');
    }
    if (platform) {
      query.platform = new RegExp(platform, 'i');
    }

    // If not allTime, filter by recent date
    if (allTime !== 'true') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }

    // Get earnings with populated campaign data
    let earnings = await Earning.find(query).populate('campaignId');

    let data = earnings.map(earning => ({
      creator: earning.creator,
      platform: earning.platform,
      revenue: earning.revenue,
      cost: earning.cost,
      roi: earning.roi,
      campaignName: earning.campaignId ? earning.campaignId.name : 'Unknown Campaign',
      impressions: earning.impressions,
      engagement: earning.engagement,
      clicks: earning.clicks,
      conversions: earning.conversions,
      date: earning.date
    }));

    // If no data in DB, use mock data
    if (data.length === 0) {
      data = [
        { creator: 'Creator1', platform: 'Instagram', revenue: 1000, cost: 500, roi: 100, campaignName: 'Summer Campaign', impressions: 50000, engagement: 2500 },
        { creator: 'Creator2', platform: 'TikTok', revenue: 800, cost: 400, roi: 100, campaignName: 'Product Launch', impressions: 75000, engagement: 3750 },
        { creator: 'Creator1', platform: 'YouTube', revenue: 1200, cost: 600, roi: 100, campaignName: 'Brand Awareness', impressions: 100000, engagement: 5000 },
        { creator: 'Creator3', platform: 'Instagram', revenue: 900, cost: 450, roi: 100, campaignName: 'Holiday Promo', impressions: 60000, engagement: 3000 },
        { creator: 'Creator4', platform: 'TikTok', revenue: 750, cost: 375, roi: 100, campaignName: 'User Generated', impressions: 80000, engagement: 4000 },
        { creator: 'Creator2', platform: 'YouTube', revenue: 1100, cost: 550, roi: 100, campaignName: 'Influencer Collab', impressions: 90000, engagement: 4500 }
      ];

      if (creator) {
        data = data.filter(item => item.creator.toLowerCase().includes(creator.toLowerCase()));
      }
      if (platform) {
        data = data.filter(item => item.platform.toLowerCase().includes(platform.toLowerCase()));
      }
    }

    // Create CSV
    const csvHeader = 'Creator,Platform,Campaign,Revenue,Cost,ROI,Impressions,Engagement,Clicks,Conversions,Date\n';
    const csvRows = data.map(item => {
      const roi = typeof item.roi === 'number' ? item.roi.toFixed(2) + '%' : item.roi;
      const date = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
      return `${item.creator},${item.platform},${item.campaignName},${item.revenue},${item.cost},${roi},${item.impressions || 0},${item.engagement || 0},${item.clicks || 0},${item.conversions || 0},${date}`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="financial-report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};