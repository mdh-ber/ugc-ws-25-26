const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const cors = require("cors");
const app = express();

// =====================
// MIDDLEWARE
// =====================

// ✅ Increase payload limits to avoid 413 (adjust if needed)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ CORS: allow your frontend origin
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Preflight
app.options("*", cors());

// =====================
// DATABASE
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await createDefaultAdmin(); // ✅ add this
  })
  .catch((err) => console.log(err));

// =====================
// ROUTES
// =====================
app.use("/api/rewards", require("./routes/rewardRoutes"));
app.use("/api/review-requests", require("./routes/reviewRequestRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/uu", require("./routes/uuRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
// app.use("/api/referrals", require("./routes/referralRoutes"));
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));



// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");

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
      console.log("📧 Email:", adminEmail);
      console.log("🔑 Password:", adminPassword);
      return;
    }

    await User.create({
      email: adminEmail,
      passwordHash,
      role: "admin",
    });

    console.log("✅ Default admin created");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
  } catch (err) {
    console.error("Failed to create/reset default admin:", err);
  }
};

module.exports = createDefaultAdmin;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});