const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    primaryEmail: { type: String, required: true, lowercase: true, trim: true },
    secondaryEmail: { type: String, default: "" },

    gender: { type: String, default: "" },
    dob: { type: Date, default: null },
    city: { type: String, default: "" },
    mobile: { type: String, default: "" },

    joinedDate: { type: String, default: "" },
    course: { type: String, default: "" },
    intake: { type: String, default: "" },
    primaryLanguage: { type: String, default: "" },

    // store as array
    socialAccounts: { type: [String], default: [] },

    // You currently use base64 string in frontend, so store base64 string here
    profilePic: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);