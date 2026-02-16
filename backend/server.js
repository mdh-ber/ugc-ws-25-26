const express = require("express");

const mongoose = require("mongoose");
require("dotenv").config();


const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require('./routes/eventRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const rewardRoutes = require("./routes/rewardRoutes");
app.use("/api/rewards", rewardRoutes);


// Routes
app.use("/api/review-requests", require("./routes/reviewRequestRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/uu", require("./routes/uuRoutes"));
app.use("/api/guidelines", require("./routes/guidelinesRoutes.")); 
app.use('/api/events', eventRoutes);



const PORT = process.env.PORT || 5000;


app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
