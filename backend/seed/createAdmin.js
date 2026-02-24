const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/user.model");

(async () => {
  try {
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for admin seed");

    const email = process.env.ADMIN_EMAIL.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      email,
      passwordHash,
      role: "admin",
    });

    console.log("✅ Admin user created:", email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();