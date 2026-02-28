const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    bounceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      comment: "Bounce rate as percentage",
    },
    avgSessionDuration: {
      type: Number,
      default: 0,
      comment: "Average session duration in seconds",
    },
    goalCompletions: {
      type: Number,
      default: 0,
    },
    newUsers: {
      type: Number,
      default: 0,
    },
    returningUsers: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

analyticsSchema.index({ date: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
