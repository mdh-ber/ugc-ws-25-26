const express = require('express');
const cors = require('cors');
require('dotenv').config();

const guidelineRoutes = require('./routes/guidelines');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'UGC Guideline Service API',
    version: '1.0.0',
    endpoints: {
      guidelines: '/api/guidelines'
    }
  });
});

app.use('/api/guidelines', guidelineRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
