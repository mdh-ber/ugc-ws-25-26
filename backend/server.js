// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import milestoneTypeRoutes from "./routes/milestoneTypeRoutes.js";
import userMilestoneRoutes from "./routes/userMilestoneRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
