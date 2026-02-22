import mongoose from "mongoose";

const pointsProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PointsProfile =
  mongoose.models.PointsProfile ||
  mongoose.model("PointsProfile", pointsProfileSchema);

export default PointsProfile;