// backend/models/MilestoneType.js
import mongoose from "mongoose";

const milestoneTypeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // e.g., "reviews", "trainings", "income", "leaderboard", "platforms"
    category: { type: String, required: true, trim: true },

    // Unit being tracked
    metric: {
      type: String,
      enum: ["points", "clicks", "posts", "custom"],
      default: "points",
      index: true,
    },

    // How to evaluate: "goal" (reach target) or "leaderboard" (top-N)
    computeMethod: {
      type: String,
      enum: ["goal", "leaderboard"],
      default: "goal",
      index: true,
    },

    // Used when computeMethod="goal"
    goal: { type: Number, required: true, min: 0 },

    rewardPoints: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },

    // Periodicity of evaluation
    period: {
      type: String,
      enum: ["lifetime", "monthly", "weekly"],
      default: "lifetime",
      index: true,
    },

    // Scope of award
    scope: {
      type: String,
      enum: ["global", "city", "platform"],
      default: "global",
      index: true,
    },

    // If scope is not global (e.g., "Berlin", "Düsseldorf" or a platform code)
    scopeValue: { type: String, default: null, index: true },

    // For leaderboard milestones: number of winners
    slots: { type: Number, default: 1, min: 1 },

    version: { type: Number, default: 1, min: 1 },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true }
);

// Helpful indexes / search
milestoneTypeSchema.index({ category: 1, isActive: 1 });
milestoneTypeSchema.index({ title: "text", description: "text" });

export default mongoose.model("MilestoneType", milestoneTypeSchema);