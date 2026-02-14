require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profiles", profileRoutes);
app.use("/api/trainings", require("./routes/trainingRoutes"));

const uuRoutes = require("./routes/uuRoutes");
app.use("/api/uu", uuRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

