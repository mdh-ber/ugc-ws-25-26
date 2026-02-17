// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import MilestoneType from "./models/MilestoneType.js";

dotenv.config();

// Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in your .env file!");
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;

// Sample milestones
const milestones = [
  {
    title: "Premium Badge",
    description: "Unlock premium profile badge",
    category: "profile",
    goal: 10,
    rewardPoints: 500,
    isActive: true,
  },
  {
    title: "Top Reviewer",
    description: "Leave 50 reviews to get this badge",
    category: "reviews",
    goal: 50,
    rewardPoints: 300,
    isActive: true,
  },
  {
    title: "Training Master",
    description: "Complete 5 trainings",
    category: "trainings",
    goal: 5,
    rewardPoints: 700,
    isActive: true,
  },
  {
    title: "Income Achiever",
    description: "Reach $1000 in income",
    category: "income",
    goal: 1000,
    rewardPoints: 1000,
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    console.log("🗑️  Clearing existing milestones...");
    await MilestoneType.deleteMany({});
    console.log(" Existing milestones cleared");

    console.log("Adding new milestones...");
    const inserted = await MilestoneType.insertMany(milestones);
    console.log(`Inserted ${inserted.length} milestones successfully`);

    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};

seedDB();
