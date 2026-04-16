// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null, index: true }, // null => global notification
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, default: "info", trim: true }, // info | success | warning | error
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);