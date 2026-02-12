const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  firstName: String,
  lastName: String,
  primaryEmail: String,
  secondaryEmail: String,
  gender: String,
  dob: String,
  city: String,
  mobile: String,
  joinedDate: String,
  course: String,
  intake: String,
  primaryLanguage: String,
   profilePic: {
    data: Buffer,
    contentType: String,
  },
  // profilePic: String,
  socialAccounts: [String],
});

module.exports = mongoose.model("Profile", profileSchema);

