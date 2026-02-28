const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your user model is named 'User'
      required: true,
    },
    caption: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    mediaUrl: {
      type: String, // URL from your image/video upload service (e.g., Cloudinary/AWS)
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none",
    },
    hashtags: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);