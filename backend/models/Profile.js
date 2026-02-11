// const mongoose = require("mongoose");

// const profileSchema = new mongoose.Schema({
//   firstName: { type: String, default: "" },
//   lastName: { type: String, default: "" },
//   primaryEmail: { type: String, default: "" },
//   secondaryEmail: { type: String, default: "" },
//   gender: { type: String, default: "" },
//   dob: { type: String, default: "" },
//   city: { type: String, default: "" },
//   mobile: { type: String, default: "" },
//   joinedDate: { type: String, default: "" },
//   course: { type: String, default: "" },
//   intake: { type: String, default: "" },
//   primaryLanguage: { type: String, default: "" },
//   profilePic: { type: String, default: "" },
//   socialAccounts: { type: [String], default: [] }
// });

// module.exports = mongoose.model("Profile", profileSchema);
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

