const express = require("express");
const router = express.Router();

const Reward = require("../models/reward");
const Profile = require("../models/profile");
router.get("/", async (req, res) => {
  const rewards = await Reward.find({ isActive: true });
  res.json(rewards);
});

router.post("/redeem", async (req, res) => {
  const { userId, rewardId } = req.body;

  try {
    const profile = await Profile.findOne({ userId });
    const reward = await Reward.findById(rewardId);

    if (!profile || !reward)
      return res.status(404).json({ message: "Not found" });

    if (profile.points < reward.pointsRequired)
      return res.status(400).json({ message: "Not enough points" });

    profile.points -= reward.pointsRequired;
    reward.stock -= 1;

    await profile.save();
    await reward.save();

    res.json({ message: "Reward redeemed successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const rewards = await Reward.find({ isActive: true });

    res.json({
      totalPoints: profile.points,
      conversionRate: 0.5,
      rewards
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
