<<<<<<< HEAD
// const mongoose = require("mongoose");

// const profileSchema = new mongoose.Schema({
//   userId: mongoose.Schema.Types.ObjectId,
//   points: { type: Number, default: 0 }
// });

// module.exports =

//   mongoose.models.Profile || mongoose.model("Profile", profileSchema);
//   mongoose.models.Profile ||
//   mongoose.model("Profile", profileSchema);
=======
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  points: { type: Number, default: 0 }
});

module.exports = mongoose.model("Profile", profileSchema);
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
