// backend/controllers/awardController.js
import MilestoneType from "../models/MilestoneType.js";
import UserMilestone from "../models/UserMilestone.js";

/**
 * POST /user-milestones/award
 * Body:
 * {
 *   milestoneTypeId: "ObjectId",
 *   periodKey: "YYYY-MM",         // e.g., "2026-02"
 *   scopeValue: "Berlin",         // optional if scope != global
 *   winners: [
 *     { creatorId: "u1", value: 123, rank: 1 },
 *     { creatorId: "u2", value: 110, rank: 2 }
 *   ]
 * }
 */
export const awardLeaderboardWinners = async (req, res) => {
  try {
    const { milestoneTypeId, periodKey, scopeValue, winners } = req.body;

    if (!milestoneTypeId || !periodKey || !Array.isArray(winners) || winners.length === 0) {
      return res.status(400).json({ error: "milestoneTypeId, periodKey and non-empty winners[] are required" });
    }

    const type = await MilestoneType.findById(milestoneTypeId);
    if (!type) return res.status(404).json({ error: "MilestoneType not found" });

    if (type.computeMethod !== "leaderboard") {
      return res.status(400).json({ error: "This milestone type is not leaderboard-based" });
    }

    const top = type.slots && type.slots > 0 ? winners.slice(0, type.slots) : winners;

    const results = [];
    for (const w of top) {
      const { creatorId, value, rank } = w;
      if (!creatorId) continue;

      const doc = await UserMilestone.findOneAndUpdate(
        { creatorId, milestoneTypeId: type._id, periodKey },
        {
          $set: {
            milestoneVersionSnapshot: type.version,
            goalSnapshot: type.goal ?? 0,
            metricSnapshot: type.metric,
            scopeValueSnapshot: scopeValue ?? type.scopeValue ?? null,
            periodKey,
            rank: rank ?? null,
            awardValue: value ?? null,
            progress: value ?? 0,
            status: "awarded",
            completedAt: new Date(),
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      results.push(doc);
    }

    res.status(201).json({ awarded: results.length, items: results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};