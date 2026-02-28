const dotenv = require("dotenv");

// make sure we're using the same connection module as server.js
const connectDB = require("./config/db");

const User = require("./models/User");
const Campaign = require("./models/Campaign");
const MarketingMetric = require("./models/MarketingMetric");
const Lead = require("./models/Lead");
const Conversion = require("./models/Conversion");
const Analytics = require("./models/Analytics");
// training model exports an object with Training property
const { Training } = require("./models/Training");

// 1. load environment variables
dotenv.config();

// helper to generate random test data
function randomInt(max) {
  return Math.floor(Math.random() * max);
}

// the sample trainings used by earlier version
const trainingData = [
  // videos
  {
    title: "How to Create Viral Reels",
    type: "video",
    category: "Content Strategy",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
  },
  {
    title: "UGC Editing Masterclass",
    type: "video",
    category: "Editing",
    url: "https://www.youtube.com/watch?v=example123",
    thumbnail: "https://img.youtube.com/vi/example123/mqdefault.jpg",
  },
  // pdfs
  {
    title: "2026 Brand Guidelines",
    type: "pdf",
    category: "Guidelines",
    url: "https://www.mdh-university.de/files/brand-guide.pdf",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/337/337946.png",
  },
  {
    title: "Creator Contract Template",
    type: "pdf",
    category: "Legal",
    url: "https://www.mdh-university.de/files/contract.pdf",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/2965/2965335.png",
  },
];

async function seedData() {
  try {
    await connectDB(); // run connection

    // clear collections that we'll seed
    await Promise.all([
      Training.deleteMany(),
      User.deleteMany(),
      Campaign.deleteMany(),
      MarketingMetric.deleteMany(),
      Lead.deleteMany(),
      Conversion.deleteMany(),
      Analytics.deleteMany(),
    ]);

    // insert trainings
    await Training.insertMany(trainingData);

    // users
    const adminUser = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      roles: ["admin"],
    });
    const managerUser = await User.create({
      username: "manager",
      email: "manager@example.com",
      password: "manager123",
      roles: ["marketing_manager"],
    });
    console.log("✓ Created users");

    // campaigns
    const campaigns = await Campaign.create([
      {
        name: "Summer Sale 2024",
        type: "social",
        status: "active",
        budget: 10000,
        spent: 2500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        targetAudience: "18-35 age group, interested in summer fashion",
        createdBy: adminUser._id,
      },
      {
        name: "Product Launch",
        type: "email",
        status: "active",
        budget: 5000,
        spent: 1200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        targetAudience: "Existing customers, tech enthusiasts",
        createdBy: adminUser._id,
      },
      {
        name: "Holiday Special",
        type: "search",
        status: "draft",
        budget: 15000,
        spent: 0,
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        targetAudience: "Gift shoppers, holiday travelers",
        createdBy: managerUser._id,
      },
    ]);
    console.log("✓ Created campaigns");

    // metrics (30 days × each campaign)
    const metrics = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      campaigns.forEach((campaign) => {
        const impressions = randomInt(90000) + 10000;
        const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01));
        const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02));
        const revenue = conversions * (Math.random() * 100 + 20);
        const spend = impressions * 0.01 + clicks * 0.5;
        metrics.push({
          campaignId: campaign._id,
          campaignName: campaign.name,
          impressions,
          clicks,
          ctr: (clicks / impressions) * 100,
          conversions,
          conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
          spend,
          revenue,
          roi: spend > 0 ? ((revenue - spend) / spend) * 100 : 0,
          createdAt: date,
        });
      });
    }
    await MarketingMetric.insertMany(metrics);
    console.log(`✓ Created ${metrics.length} marketing metrics`);

    // leads
    const statuses = ["new", "contacted", "qualified", "converted", "lost"];
    const sources = ["website", "social", "email", "referral", "other"];
    const leads = [];
    for (let i = 0; i < 50; i++) {
      leads.push({
        campaignId: campaigns[randomInt(campaigns.length)]._id,
        email: `lead${i}@example.com`,
        name: `Lead ${i}`,
        phone: `+1234567${String(i).padStart(3, "0")}`,
        status: statuses[randomInt(statuses.length)],
        source: sources[randomInt(sources.length)],
      });
    }
    await Lead.insertMany(leads);
    console.log(`✓ Created ${leads.length} leads`);

    // conversions
    const convTypes = ["purchase", "signup", "download", "form_submit", "call"];
    const conversions = [];
    for (let i = 0; i < 30; i++) {
      conversions.push({
        campaignId: campaigns[randomInt(campaigns.length)]._id,
        type: convTypes[randomInt(convTypes.length)],
        value: randomInt(490) + 10,
        currency: "USD",
        source: sources[randomInt(sources.length)],
      });
    }
    await Conversion.insertMany(conversions);
    console.log(`✓ Created ${conversions.length} conversions`);

    // analytics
    const analyticsArr = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      analyticsArr.push({
        date,
        pageViews: randomInt(4000) + 1000,
        uniqueVisitors: randomInt(2500) + 500,
        bounceRate: Math.random() * 60 + 20,
        avgSessionDuration: randomInt(120) + 60,
        goalCompletions: randomInt(90) + 10,
        newUsers: randomInt(1300) + 200,
        returningUsers: randomInt(1300) + 200,
      });
    }
    await Analytics.insertMany(analyticsArr);
    console.log(`✓ Created ${analyticsArr.length} analytics records`);

    console.log("\n🌱 Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedData();
