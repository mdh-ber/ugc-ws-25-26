const mongoose = require("mongoose");

const guidelineSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Guideline text is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["do", "dont"],
      required: [true, 'Type must be either "do" or "dont"'],
      index: true,
    },
    category: { type: String, default: "general", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    likes: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    tags: [String],
  },
  { timestamps: true }
);

guidelineSchema.index({ text: "text", tags: "text" });

module.exports = mongoose.model("Guideline", guidelineSchema);