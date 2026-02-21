// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

<<<<<<< HEAD
import milestoneTypeRoutes from "./routes/milestoneTypeRoutes.js";
import userMilestoneRoutes from "./routes/userMilestoneRoutes.js";

dotenv.config();

=======
const cors = require("cors");
>>>>>>> origin/main
const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Health check endpoint
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "milestones" });
});

// Routes
app.use("/milestone-types", milestoneTypeRoutes);
app.use("/user-milestones", userMilestoneRoutes);

// MongoDB connect
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in your .env file!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(() => console.log("Milestones DB connected to Atlas"))
  .catch((err) => {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(` Milestones service running on port ${PORT}`));
=======
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

// GUIDELINES ROUTE
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> origin/main
