// controllers/milestoneTypeController.js
import MilestoneType from "../models/MilestoneType.js";

// Create new milestone type (Admin)
export const createMilestoneType = async (req, res) => {
  try {
    const { title, description, category, goal, rewardPoints, isActive } = req.body;

    const milestone = await MilestoneType.create({
      title,
      description,
      category,
      goal,
      rewardPoints,
      isActive: isActive ?? true,
      // updatedBy: req.user?.id  // when you add auth
    });

    res.status(201).json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update milestone type metadata (no version bump)
// Use this to update title/description/category/rewardPoints/isActive
export const updateMilestoneType = async (req, res) => {
  try {
    const allowed = ["title", "description", "category", "rewardPoints", "isActive", "updatedBy"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const milestone = await MilestoneType.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!milestone) return res.status(404).json({ error: "MilestoneType not found" });
    res.json(milestone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Change goal WITH version bump (safe update)
export const updateMilestoneGoal = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || goal < 1) return res.status(400).json({ error: "Invalid goal" });

    const existing = await MilestoneType.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "MilestoneType not found" });

    existing.goal = goal;
    existing.version = existing.version + 1;
    // existing.updatedBy = req.user?.id;
    await existing.save();

    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List milestone types with filters
export const getMilestoneTypes = async (req, res) => {
  try {
    const { category, active, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active !== undefined) filter.isActive = active === "true";

    let query = MilestoneType.find(filter).sort({ updatedAt: -1 });

    // simple text search
    if (q) {
      query = query.find({ $text: { $search: q } });
    }

    const list = await query.exec();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single milestone type
export const getMilestoneTypeById = async (req, res) => {
  try {
    const doc = await MilestoneType.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "MilestoneType not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};