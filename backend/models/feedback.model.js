const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);