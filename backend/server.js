require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const uuRoutes = require("./routes/uu");
const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/review-requests", require("./routes/reviewRequestRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/uu", require("./routes/uuRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/uu", uuRoutes);
// PORT (must be BEFORE listen)
const PORT = process.env.PORT || 5000;

// Start server
app.get("/api/uu/referral/users", (req, res) => {
  res.json({
    users: [
      { id: "1", name: "John", email: "john@test.com", date: "2026-02-15" },
      { id: "2", name: "Sara", email: "sara@test.com", date: "2026-02-14" },
    ],
  });
});

app.get("/api/uu/referee/users", (req, res) => {
  res.json({
    users: [{ id: "3", name: "Adam", email: "adam@test.com", date: "2026-02-15" }],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});