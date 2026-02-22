const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
const Earning = require('./models/Earning');
require('dotenv').config();

const seedFinancialData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Campaign.deleteMany({});
    await Earning.deleteMany({});
    console.log('Cleared existing data');

    // Create sample campaigns
    const campaigns = await Campaign.insertMany([
      {
        name: 'Summer Campaign 2024',
        description: 'Promote summer products and boost seasonal sales',
        budget: 50000,
        platform: 'Instagram',
        assignedCreators: ['Creator1', 'Creator3'],
        targetAudience: '18-35 year olds interested in lifestyle',
        goals: 'Increase brand awareness and drive summer product sales',
        createdBy: 'admin',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        status: 'completed'
      },
      {
        name: 'Product Launch TikTok',
        description: 'Launch new product line with viral TikTok content',
        budget: 75000,
        platform: 'TikTok',
        assignedCreators: ['Creator2', 'Creator4'],
        targetAudience: 'Gen Z and young millennials',
        goals: 'Generate buzz and drive product pre-orders',
        createdBy: 'admin',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30'),
        status: 'active'
      },
      {
        name: 'Brand Awareness YouTube',
        description: 'Build brand recognition through educational content',
        budget: 100000,
        platform: 'YouTube',
        assignedCreators: ['Creator1', 'Creator2'],
        targetAudience: '25-45 year olds seeking product information',
        goals: 'Establish thought leadership and increase brand recall',
        createdBy: 'admin',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        status: 'active'
      },
      {
        name: 'Holiday Promotion',
        description: 'Drive holiday season sales with festive content',
        budget: 60000,
        platform: 'Instagram',
        assignedCreators: ['Creator3'],
        targetAudience: 'Gift buyers and holiday shoppers',
        goals: 'Boost holiday sales and engagement',
        createdBy: 'admin',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31'),
        status: 'active'
      },
      {
        name: 'User Generated Content',
        description: 'Encourage user participation and content creation',
        budget: 80000,
        platform: 'TikTok',
        assignedCreators: ['Creator4'],
        targetAudience: 'Content creators and brand advocates',
        goals: 'Build community and authentic engagement',
        createdBy: 'admin',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-31'),
        status: 'active'
      },
      {
        name: 'Influencer Collaboration',
        description: 'Partner with key influencers for authentic promotion',
        budget: 90000,
        platform: 'YouTube',
        assignedCreators: ['Creator2'],
        targetAudience: 'Influencer followers and brand enthusiasts',
        goals: 'Leverage influencer credibility for brand trust',
        createdBy: 'admin',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-10-31'),
        status: 'completed'
      }
    ]);

    console.log('Created campaigns:', campaigns.length);

    // Create sample earnings linked to campaigns
    const earnings = [
      // Summer Campaign earnings
      {
        campaignId: campaigns[0]._id,
        creator: 'Creator1',
        platform: 'Instagram',
        revenue: 12500,
        cost: 6250,
        impressions: 50000,
        engagement: 2500,
        clicks: 1250,
        conversions: 125,
        date: new Date('2024-07-15'),
        description: 'Summer product promotion'
      },
      {
        campaignId: campaigns[0]._id,
        creator: 'Creator3',
        platform: 'Instagram',
        revenue: 9800,
        cost: 4900,
        impressions: 42000,
        engagement: 2100,
        clicks: 1050,
        conversions: 105,
        date: new Date('2024-08-01'),
        description: 'Summer lifestyle content'
      },

      // Product Launch earnings
      {
        campaignId: campaigns[1]._id,
        creator: 'Creator2',
        platform: 'TikTok',
        revenue: 15200,
        cost: 7600,
        impressions: 75000,
        engagement: 3750,
        clicks: 1875,
        conversions: 188,
        date: new Date('2024-09-15'),
        description: 'Product launch viral video'
      },
      {
        campaignId: campaigns[1]._id,
        creator: 'Creator4',
        platform: 'TikTok',
        revenue: 11800,
        cost: 5900,
        impressions: 65000,
        engagement: 3250,
        clicks: 1625,
        conversions: 163,
        date: new Date('2024-09-20'),
        description: 'Product demo challenge'
      },

      // Brand Awareness earnings
      {
        campaignId: campaigns[2]._id,
        creator: 'Creator1',
        platform: 'YouTube',
        revenue: 18500,
        cost: 9250,
        impressions: 100000,
        engagement: 5000,
        clicks: 2500,
        conversions: 250,
        date: new Date('2024-08-15'),
        description: 'Brand story video'
      },
      {
        campaignId: campaigns[2]._id,
        creator: 'Creator2',
        platform: 'YouTube',
        revenue: 16800,
        cost: 8400,
        impressions: 85000,
        engagement: 4250,
        clicks: 2125,
        conversions: 213,
        date: new Date('2024-09-01'),
        description: 'Educational content series'
      },

      // Holiday Promotion earnings
      {
        campaignId: campaigns[3]._id,
        creator: 'Creator3',
        platform: 'Instagram',
        revenue: 14200,
        cost: 7100,
        impressions: 60000,
        engagement: 3000,
        clicks: 1500,
        conversions: 150,
        date: new Date('2024-11-15'),
        description: 'Holiday season promotion'
      },

      // User Generated earnings
      {
        campaignId: campaigns[4]._id,
        creator: 'Creator4',
        platform: 'TikTok',
        revenue: 13600,
        cost: 6800,
        impressions: 80000,
        engagement: 4000,
        clicks: 2000,
        conversions: 200,
        date: new Date('2024-10-20'),
        description: 'UGC campaign highlights'
      },

      // Influencer Collaboration earnings
      {
        campaignId: campaigns[5]._id,
        creator: 'Creator2',
        platform: 'YouTube',
        revenue: 22100,
        cost: 11050,
        impressions: 90000,
        engagement: 4500,
        clicks: 2250,
        conversions: 225,
        date: new Date('2024-09-15'),
        description: 'Influencer partnership video'
      }
    ];

    await Earning.insertMany(earnings);
    console.log('Created earnings:', earnings.length);

    console.log('Financial data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedFinancialData();