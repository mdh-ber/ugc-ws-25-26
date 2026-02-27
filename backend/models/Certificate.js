const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issueDate: { type: String, required: true, trim: true }, // YYYY-MM-DD
    issuer: { 
  type: String, 
  required: true, 
  trim: true, 
  default: "Marketing Manager" 
},
    // ✅ NEW: person name
    issuedTo: { type: String, required: true, trim: true },

    // ✅ type can be Course/Professional/... or custom string if "Other"
    type: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);