const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Training = require('./models/Training'); // Point to your Schema file

// 1. Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB Connected'))
  .catch(err => console.log(err));

// 2. The Data List
const videos = [
  {
    title: "Welcome to MDH",
    type: "video",
    url: "https://youtu.be/example1",
    category: "Onboarding"
  },
  {
    title: "Advanced Editing",
    type: "video",
    url: "https://youtu.be/example2",
    category: "Skills"
  }
];

// 3. Insert it
const importData = async () => {
  try {
    await Training.deleteMany(); // Clears old data (Optional)
    await Training.insertMany(videos); // Adds new data
    console.log('Data Added!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();