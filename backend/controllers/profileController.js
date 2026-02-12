const Profile = require("../models/Profile");

// ===== GET PROFILE =====
exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await Profile.create({ userId: req.user._id });
    }
     const profileData = profile.toObject();

    // Convert profilePic buffer to Base64 for frontend
    if (profile.profilePic && profile.profilePic.data) {
      profileData.profilePic = `data:${profile.profilePic.contentType};base64,${profile.profilePic.data.toString("base64")}`;
    } else {
      profileData.profilePic = null;
    }

    res.json(profileData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== UPDATE PROFILE =====
exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) profile = new Profile({ userId: req.user._id });
    // Only allow safe fields to update
const allowedFields = [
  "firstName",
  "lastName",
  "secondaryEmail",
  "gender",
  "dob",
  "city",
  "mobile",
  "course",
  "intake",
  "primaryLanguage",
  "socialAccounts"
];

allowedFields.forEach((field) => {
  if (req.body[field] !== undefined) {
    profile[field] = req.body[field];
  }
});

    // Object.assign(profile, req.body);

    // if (req.file) {
    //   profile.profilePic = `/uploads/${req.file.filename}`;
    // }
    if (req.file) {
  profile.profilePic = {
    data: req.file.buffer,
    contentType: req.file.mimetype,
  };
}


    await profile.save();
     const profileData = profile.toObject();
    if (profile.profilePic && profile.profilePic.data) {
      profileData.profilePic = `data:${profile.profilePic.contentType};base64,${profile.profilePic.data.toString("base64")}`;
    } else {
      profileData.profilePic = null;
    }
    res.json(profileData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
