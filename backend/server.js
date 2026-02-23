const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const rewardRoutes = require("./routes/rewardRoutes");
const reviewRequestRoutes = require("./routes/reviewRequestRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const profileRoutes = require("./routes/profileRoutes");
const uuRoutes = require("./routes/uuRoutes");
const eventRoutes = require("./routes/eventRoutes");
const guidelinesRoutes = require("./routes/guidelinesRoutes");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const referralVisitRoutes = require("./routes/referralVisitRoutes");

const bcrypt = require("bcryptjs");
const User = require("./models/user.model");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
// =====================
// DEFAULT ADMIN CREATION
// =====================
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@mdh.com";
    const adminPassword = "Admin@123";

    const existingAdmin = await User.findOne({ email: adminEmail });
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log("✅ Default admin password RESET");
      return;
    }

    await User.create({
      email: adminEmail,
      passwordHash,
      role: "admin",
    });

    console.log("✅ Default admin created");
  } catch (err) {
    console.error("Failed to create/reset default admin:", err);
  }
};

// =====================
// ROUTES
// =====================
app.use("/api/rewards", rewardRoutes);
app.use("/api/review-requests", reviewRequestRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/uu", uuRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/guidelines", guidelinesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/referrals", referralVisitRoutes);

// =====================
// DB + SERVER START
// =====================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await createDefaultAdmin();
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.log(err));