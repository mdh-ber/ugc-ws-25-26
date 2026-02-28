<<<<<<< Updated upstream
import mongoose from "mongoose";

=======
<<<<<<< Updated upstream
const mongoose = require("mongoose");
=======
// import mongoose from "mongoose";

>>>>>>> Stashed changes
>>>>>>> Stashed changes
const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    primaryEmail: { type: String, default: "" },
    secondaryEmail: { type: String, default: "" },

    gender: { type: String, default: "" },
    dob: { type: Date, default: null },
    city: { type: String, default: "" },
    mobile: { type: String, default: "" },

    joinedDate: { type: String, default: "" },
    course: { type: String, default: "" },
    intake: { type: String, default: "" },
    primaryLanguage: { type: String, default: "" },

    socialAccounts: { type: [String], default: [] },
    profilePic: { type: String, default: "" },
  },
  { timestamps: true }
);

const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);
<<<<<<< Updated upstream

<<<<<<< Updated upstream
export default UserProfile;
=======
module.exports = UserProfile;
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
