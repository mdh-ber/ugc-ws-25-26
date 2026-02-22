import mongoose from "mongoose";

const { Schema } = mongoose;

const pointsProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // each user has only one points profile
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development (important for nodemon / hot reload)
const PointsProfile =
  mongoose.models.PointsProfile ||
  mongoose.model("PointsProfile", pointsProfileSchema);

export default PointsProfile;