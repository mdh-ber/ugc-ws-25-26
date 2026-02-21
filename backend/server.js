const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const cors = require("cors");
const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());

// CORS 
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

// GUIDELINES ROUTE
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));
// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});