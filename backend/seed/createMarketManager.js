const crypto = require("crypto");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/user.model");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for manager seed");

    const email = process.env.MANAGER_EMAIL.toLowerCase();
    const password = process.env.MANAGER_PASSWORD;

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Market Manager already exists:", email);
      process.exit(0);
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    await User.create({
      email,
      password: passwordHash,
      role: "manager",
    });

    console.log("Market Manager user created:", email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();