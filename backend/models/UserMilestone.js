// backend/models/UserMilestone.js
import mongoose from "mongoose";

const userMilestoneSchema = new mongoose.Schema(
  {
    creatorId: { type: String, required: true, index: true },

    milestoneTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MilestoneType",
      required: true,
      index: true,
    },

    // Snapshots to keep progress stable across type changes
    milestoneVersionSnapshot: { type: Number, required: true, min: 1 },
    goalSnapshot: { type: Number, required: true, min: 0 },

    // NEW snapshots
    metricSnapshot: {
      type: String,
      enum: ["points", "clicks", "posts", "custom"],
      default: "points",
    },
    scopeValueSnapshot: { type: String, default: null },

    // e.g., "2026-02" for monthly awards
    periodKey: { type: String, default: null, index: true },

    // For leaderboard awards
    rank: { type: Number, default: null },
    awardValue: { type: Number, default: null }, // the metric value used to award

    progress: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["in_progress", "completed", "expired", "awarded"],
      default: "in_progress",
      index: true,
    },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Example supporting index (non-unique by design)
userMilestoneSchema.index(
  { creatorId: 1, milestoneTypeId: 1, periodKey: 1, status: 1 },
  { unique: false }
);

export default mongoose.model("UserMilestone", userMilestoneSchema);