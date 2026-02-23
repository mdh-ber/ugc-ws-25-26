const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    type: {
      type: String,
      enum: ["like", "comment", "follow", "reward", "milestone", "system"],
      default: "system",
    },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    link: { type: String, default: "" },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);