// controllers/userMilestoneController.js
import MilestoneType from "../models/MilestoneType.js";
import UserMilestone from "../models/UserMilestone.js";

// Assign a milestone type to a user (creates snapshot)
export const assignMilestone = async (req, res) => {
  try {
    const { creatorId, milestoneTypeId } = req.body;
    if (!creatorId || !milestoneTypeId) {
      return res.status(400).json({ error: "creatorId and milestoneTypeId are required" });
    }

    const milestoneType = await MilestoneType.findById(milestoneTypeId);
    if (!milestoneType) return res.status(404).json({ error: "MilestoneType not found" });
    if (!milestoneType.isActive) return res.status(400).json({ error: "MilestoneType is inactive" });

    const userMilestone = await UserMilestone.create({
      creatorId,
      milestoneTypeId: milestoneType._id,
      milestoneVersionSnapshot: milestoneType.version,
      goalSnapshot: milestoneType.goal,
      progress: 0,
      status: "in_progress",
    });

    res.status(201).json(userMilestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update progress; auto-complete when reaching goalSnapshot
export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress === undefined || progress < 0) {
      return res.status(400).json({ error: "Valid progress is required" });
    }

    const milestone = await UserMilestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ error: "UserMilestone not found" });

    milestone.progress = progress;

    if (milestone.progress >= milestone.goalSnapshot && milestone.status !== "completed") {
      milestone.status = "completed";
      milestone.completedAt = new Date();
    }

    await milestone.save();
    res.json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all milestones for a user (optionally filter by status)
export const getUserMilestones = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { creatorId: req.params.creatorId };
    if (status) filter.status = status;

    const list = await UserMilestone.find(filter)
      .populate("milestoneTypeId")
      .sort({ updatedAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one user milestone
export const getUserMilestoneById = async (req, res) => {
  try {
    const doc = await UserMilestone.findById(req.params.id).populate("milestoneTypeId");
    if (!doc) return res.status(404).json({ error: "UserMilestone not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};