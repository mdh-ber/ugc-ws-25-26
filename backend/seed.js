// backend/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import MilestoneType from "./models/MilestoneType.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in your .env file!");
  process.exit(1);
}
const MONGO_URI = process.env.MONGO_URI;

const milestones = [
  // 1) Creator of Platforms – goal-based (posts)
  {
    title: "Creator of Platforms",
    description: "Post across platforms to reach the goal",
    category: "platforms",
    metric: "posts",
    computeMethod: "goal",
    period: "lifetime",
    scope: "platform",
    scopeValue: null,
    goal: 10,
    rewardPoints: 300,
    isActive: true,
  },

  // 2) Best Creators of the Month – global leaderboard (top 3)
  {
    title: "Best Creators of the Month",
    description: "Top creators by points this month",
    category: "leaderboard",
    metric: "points",
    computeMethod: "leaderboard",
    period: "monthly",
    scope: "global",
    scopeValue: null,
    goal: 0,
    slots: 3,
    rewardPoints: 1000,
    isActive: true,
  },

  // 3a) Best Creator – Berlin – city leaderboard (top 1)
  {
    title: "Best Creator – Berlin",
    description: "Top creator in Berlin this month",
    category: "leaderboard",
    metric: "points",
    computeMethod: "leaderboard",
    period: "monthly",
    scope: "city",
    scopeValue: "Berlin",
    goal: 0,
    slots: 1,
    rewardPoints: 800,
    isActive: true,
  },

  // 3b) Best Creator – Düsseldorf – city leaderboard (top 1)
  {
    title: "Best Creator – Düsseldorf",
    description: "Top creator in Düsseldorf this month",
    category: "leaderboard",
    metric: "points",
    computeMethod: "leaderboard",
    period: "monthly",
    scope: "city",
    scopeValue: "Düsseldorf",
    goal: 0,
    slots: 1,
    rewardPoints: 800,
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    console.log(" Clearing existing milestones...");
    await MilestoneType.deleteMany({});
    console.log("Existing milestones cleared");

    console.log("Adding new milestones...");
    const inserted = await MilestoneType.insertMany(milestones);
    console.log(`Inserted ${inserted.length} milestones successfully`);

    await mongoose.connection.close();
    console.log(" MongoDB connection closed");
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();