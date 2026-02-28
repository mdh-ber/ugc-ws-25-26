<<<<<<< HEAD
// const mongoose = require("mongoose");

// const feedbackSchema = new mongoose.Schema(
//   {
//     feedback: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Feedback", feedbackSchema);
=======
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
