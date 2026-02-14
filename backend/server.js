require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const eventRoutes = require('./routes/eventRoutes');
const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/review-requests", require("./routes/reviewRequestRoutes"));


app.use("/api/trainings", require("./routes/trainingRoutes"));
// app.use("/api/review-requests", require("./routes/reviewRequestRoutes")); //



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
