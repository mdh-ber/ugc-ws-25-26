const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ✅ 1. UNCOMMENTED EXPRESS INITIALIZATION
const app = express();

// =====================
// MIDDLEWARE
// =====================
// ✅ 2. UNCOMMENTED JSON PARSER (Crucial for forms!)
app.use(express.json()); 

app.use(cors());
app.options("*", cors());

// =====================
// DATABASE
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
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
app.use("/api/referrals", require("./routes/referralRoutes"));
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));

// ✅ 3. ADDED LEADS MOCK DATA ROUTE
app.get("/api/leads", (req, res) => {
  const leadStats = [
    { _id: "TikTok", count: 842 },
    { _id: "Instagram", count: 530 },
    { _id: "YouTube", count: 215 }
  ];
  res.status(200).json(leadStats);
});

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});