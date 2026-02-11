const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://vamanreddy87658:CU70x3n38Nyf7VC4@backenddb.x8tvvh1.mongodb.net/profileDB?retryWrites=true&w=majority")
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
