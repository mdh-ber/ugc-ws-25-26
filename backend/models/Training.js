const mongoose = require("mongoose");
const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },  
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports =
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  mongoose.models.Training || mongoose.model("Training", trainingSchema);
=======
  mongoose.models.Training ||
  mongoose.model("Training", trainingSchema);
>>>>>>> Stashed changes
=======
  mongoose.models.Training ||
  mongoose.model("Training", trainingSchema);
>>>>>>> Stashed changes
