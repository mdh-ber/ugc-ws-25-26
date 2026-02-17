require("dotenv").config({ path: __dirname + "/.env" });
//require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/leads", require("./routes/lead"));

// Static Folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`)
);
