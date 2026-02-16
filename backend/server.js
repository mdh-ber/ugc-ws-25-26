require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require('./routes/eventRoutes');
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
app.use("/api/guidelines", require("./routes/guidelinesRoutes")); 
app.use('/api/events', eventRoutes);



const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});