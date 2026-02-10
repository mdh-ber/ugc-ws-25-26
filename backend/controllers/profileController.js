const Profile = require("../models/Profile");

// ===== GET PROFILE =====
exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await Profile.create({ userId: req.user._id });
    }

    res.json(profile);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== UPDATE PROFILE =====
exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) profile = new Profile({ userId: req.user._id });

    Object.assign(profile, req.body);

    if (req.file) {
      profile.profilePic = `/uploads/${req.file.filename}`;
    }

    await profile.save();
    res.json(profile);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
