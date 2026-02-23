const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    title: { type: String, required: true, trim: true },
    issuer: { type: String, default: "MDH University", trim: true },

    domain: { type: String, default: "General", trim: true },
    certType: {
      type: String,
      enum: ["Participation", "Achievement", "Completion", "Excellence", "Other"],
      default: "Participation",
    },

    description: { type: String, default: "", trim: true },

    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null },

    certificateUrl: { type: String, default: "", trim: true },

    incomeMade: { type: Number, default: 0 },
    pointsAwarded: { type: Number, default: 0 },

    status: { type: String, enum: ["active", "revoked"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);