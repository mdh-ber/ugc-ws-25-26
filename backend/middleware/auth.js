const mongoose = require("mongoose");
const Profile = require("../models/Profile");

module.exports = async function (req, res, next) {
  try {
    const userId = req.headers.userid;

    if (!userId) {
      return res.status(401).json({ message: "UserId missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid UserId format" });
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { _id: userId };
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
