const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns"); // 0️⃣ Fix SRV DNS resolution
require("dotenv").config();

const cors = require("cors");
const app = express();

// =====================
// DNS FIX FOR WINDOWS SRV
// =====================
dns.setServers(['8.8.8.8', '1.1.1.1']); // Use Google's DNS servers

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
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() =>  console.log('✅ MongoDB connected to database:', mongoose.connection.name))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
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
app.use("/api/financial-report", require("./routes/financialReportRoutes"));
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/analytics", require("./routes/financialReportRoutes"));

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});