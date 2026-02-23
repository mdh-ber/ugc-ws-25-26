// =====================
// IMPORTS (COMMONJS)
// =====================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// MIDDLEWARE
// =====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// =====================
// TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully 🚀" });
});

// =====================
// ROUTES
// =====================
app.use("/api/rewards", require("./routes/rewardRoutes"));
app.use("/api/review-requests", require("./routes/reviewRequestRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/uu", require("./routes/uuRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/referrals", require("./routes/referralRoutes"));
app.use("/api/lead", require("./routes/leadRoutes"));
app.use("/api/visits", require("./routes/visitRoutes"));
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// =====================
// START SERVER
// =====================
async function startServer() {
  // Start backend FIRST (so proxy errors stop)
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });

  // Connect MongoDB (optional)
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("❌ MongoDB connection failed:");
    console.log(err.message);
  }
}

startServer();