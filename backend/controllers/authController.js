import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

<<<<<<< Updated upstream
import User from "../models/user.model.js";
import UserProfile from "../models/userProfile.model.js";
=======
<<<<<<< Updated upstream
// ============================
// REGISTER CONTROLLER
// ============================
async function register(req, res, readJsonBody, sendJson) {
  console.log("hello--1");
=======
import User from "../models/user.model.js";
>>>>>>> Stashed changes
import PointsProfile from "../models/pointsProfile.model.js";

// helper to sign JWT
const signToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ======================
// POST /api/auth/login
// ======================
const login = async (req, res) => {
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ==============================
// POST /api/auth/register
// ==============================
const register = async (req, res) => {
  try {
    const email = (req.body.primaryEmail || req.body.email || "")
      .trim()
      .toLowerCase();

    const password = (req.body.password || "").trim();

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      role: "user",
    });

    // normalize socials
    let socialAccounts = req.body.socialAccounts || [];
    if (typeof socialAccounts === "string") {
      socialAccounts = socialAccounts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // create user profile
    const profile = await UserProfile.create({
      userId: user._id,

      firstName: req.body.firstName || "",
      lastName: req.body.lastName || "",

      primaryEmail: email,
      secondaryEmail: req.body.secondaryEmail || "",

      gender: req.body.gender || "",
      dob: req.body.dob ? new Date(req.body.dob) : null,
      city: req.body.city || "",
      mobile: req.body.mobile || "",

      joinedDate: req.body.joinedDate || "",
      course: req.body.course || "",
      intake: req.body.intake || "",
      primaryLanguage: req.body.primaryLanguage || "",

      socialAccounts,
      profilePic: req.body.profilePic || "", // base64 string
    });

    // create points profile
    await PointsProfile.create({
      userId: user._id,
      points: 0,
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export { login, register };