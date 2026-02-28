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
<<<<<<< HEAD
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
=======
    category: {
      type: String,
      default: "general",
      index: true,
    },

    // ✅ not required for now (no auth yet)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
guidelineSchema.index({ text: "text", tags: "text" });

// Method to handle likes
guidelineSchema.methods.like = function () {
  this.likes += 1;
  return this.save();
};

// Static method to get statistics
guidelineSchema.statics.getStats = async function () {
  const total = await this.countDocuments({ isActive: true });
  const dos = await this.countDocuments({ type: "do", isActive: true });
  const donts = await this.countDocuments({ type: "dont", isActive: true });

  const totalLikes = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: "$likes" } } },
  ]);

  return {
    total,
    dos,
    donts,
    totalLikes: totalLikes[0]?.total || 0,
  };
};

module.exports = mongoose.model("Guideline", guidelineSchema);
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
