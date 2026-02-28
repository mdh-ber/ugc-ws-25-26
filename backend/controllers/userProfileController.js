const UserProfile = require("../models/userProfile.model");

// GET /api/user-profile/me
// exports.getMyProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const profile = await UserProfile.findOne({ userId });
//     if (!profile) return res.status(404).json({ message: "Profile not found" });

//     res.json(profile);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.getMyProfile = async (req, res) => {
  try {
    console.log("Token user id:", req.user.id);

    const profile = await UserProfile.findOne({ userId: req.user.id });

    console.log("Profile found:", profile);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/user-profile/me
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Accept JSON body (base64 profilePic supported)
    const update = { ...req.body };

    // Normalize socials if they come as string
    if (typeof update.socialAccounts === "string") {
      update.socialAccounts = update.socialAccounts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Normalize dob
    if (update.dob === "") update.dob = null;

    const updated = await UserProfile.findOneAndUpdate(
      { userId },
      update,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Profile not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};