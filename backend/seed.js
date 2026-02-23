<<<<<<< HEAD
// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// 0️⃣ Fix SRV DNS resolution issues on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']); // Google's DNS servers

// 1️⃣ Load environment variables
dotenv.config();

// 2️⃣ Define Schema (must match your Training model)
const TrainingSchema = new mongoose.Schema({
  title: String,
  type: { 
    type: String, 
    enum: ['Video', 'PDF'] 
  },
  url: String,
  category: String,
  thumbnail: String,
  createdAt: { type: Date, default: Date.now }
});

const Training = mongoose.model('Training', TrainingSchema);

// 3️⃣ Seed data
const trainingData = [
  // --- Videos ---
=======
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
>>>>>>> c1d8eb004e3b5ee3df64bd2d5d80b2341121385e
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

<<<<<<< HEAD
  // --- PDFs ---
  {
    title: "2026 Brand Guidelines",
    type: "PDF",
    category: "Guidelines",
    url: "https://www.mdh-university.de/files/brand-guide.PDF", 
    thumbnail: "https://cdn-icons-png.flaticon.com/512/337/337946.png"
=======
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
>>>>>>> c1d8eb004e3b5ee3df64bd2d5d80b2341121385e
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

<<<<<<< HEAD
// 4️⃣ Seed function
const seedDB = async () => {
  try {
    // Connect to MongoDB (SRV URL from .env)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Remove old data
    await Training.deleteMany();
    console.log('🗑️  Old data removed');

    // Insert new data
    await Training.insertMany(trainingData);
    console.log(`✨ Success! Added ${trainingData.length} items (Videos & PDFs)`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
=======
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
>>>>>>> c1d8eb004e3b5ee3df64bd2d5d80b2341121385e
    process.exit(1);
  }
};

// 5️⃣ Run seed
seedDB();