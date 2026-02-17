const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =====================
// MIDDLEWARE
// =====================

// ⭐ CORS Configuration
// This allows your frontend to send the custom 'x-user-role' header without being blocked
app.use(cors({
  origin: "*", // In production, replace with your specific frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-user-role", "Authorization"]
}));

// Standard body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ STATIC FOLDER 
// This makes images in 'backend/uploads' accessible via http://localhost:5000/uploads/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================
// DATABASE
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// =====================
// ROUTES
// =====================
app.use("/api/rewards", require("./routes/rewardRoutes"));
app.use("/api/review-requests", require("./routes/reviewRequestRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/uu", require("./routes/uuRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads folder served at: http://localhost:${PORT}/uploads`);
});