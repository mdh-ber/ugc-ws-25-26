const mongoose = require("mongoose");

const pointsProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    points: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PointsProfile ||
  mongoose.model("PointsProfile", pointsProfileSchema);