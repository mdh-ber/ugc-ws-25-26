const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  points: { type: Number, default: 0 }
});

module.exports =
  mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);
