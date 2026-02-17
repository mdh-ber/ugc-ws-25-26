const express = require("express");
const router = express.Router();

const Reward = require("../models/reward");
const Profile = require("../models/Profile");
const RewardTransaction = require("../models/rewardTransaction");

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

    await RewardTransaction.create({
      userId,
      rewardId,
      pointsUsed: reward.pointsRequired
    });

    res.json({ message: "Reward redeemed successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
