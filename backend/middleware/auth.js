<<<<<<< HEAD
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain: { id, email, role }
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
=======
const mongoose = require("mongoose");
const Profile = require("../models/Profile");

module.exports = async function (req, res, next) {
  try {
    // const userId = req.headers.userid;
    const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({ message: "UserId missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid UserId format" });
    }

    // const profile = await Profile.findOne({ userId });

    // if (!profile) {
    //   return res.status(401).json({ message: "User not found" });
    // }

    req.user = { _id: userId };
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
