// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// =====================
// ROUTES
// =====================
import rewardRoutes from "./routes/rewardRoutes.js";
import reviewRequestRoutes from "./routes/reviewRequestRoutes.js";
import trainingRoutes from "./routes/trainingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import uuRoutes from "./routes/uuRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import guidelinesRoutes from "./routes/guidelinesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

// =====================
// MODELS
// =====================
import User from "./models/user.model.js";

// =====================
// CONFIG
// =====================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// MIDDLEWARE
// =====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

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

// =====================
// DB + SERVER START
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await createDefaultAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));