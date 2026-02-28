const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["LINK", "IMAGE", "VIDEO", "AUDIO", "FILE"],
      default: "LINK",
    },
    label: { type: String, trim: true },
  },
  { _id: false }
);

const AssignmentSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    state: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "COMPLETED"],
      default: "PENDING",
    },
    assignedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
  },
  { _id: false }
);

const CommentSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    severity: {
      type: String,
      enum: ["BLOCKER", "SUGGESTION", "NIT"],
      default: "SUGGESTION",
    },
    comment: { type: String, required: true, trim: true, maxlength: 5000 },
    guidelineId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DecisionSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    decision: {
      type: String,
      enum: ["APPROVE", "REQUEST_CHANGES", "REJECT"],
      required: true,
    },
    note: { type: String, trim: true, maxlength: 3000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StatusHistorySchema = new mongoose.Schema(
  {
    oldStatus: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED"],
    },
    newStatus: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED"],
      required: true,
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    note: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReviewRequestSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 5000 },

    platform: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, trim: true },

    notes: { type: String, trim: true, maxlength: 5000 },

    media: { type: [MediaSchema], default: [] },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED"],
      default: "SUBMITTED",
      index: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
      index: true,
    },

    deadline: { type: Date },

    assignments: { type: [AssignmentSchema], default: [] },
    comments: { type: [CommentSchema], default: [] },
    decisions: { type: [DecisionSchema], default: [] },

    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

ReviewRequestSchema.index({ creatorId: 1, createdAt: -1 });
ReviewRequestSchema.index({ status: 1, createdAt: -1 });
ReviewRequestSchema.index({ "assignments.reviewerId": 1, createdAt: -1 });

module.exports = mongoose.model("ReviewRequest", ReviewRequestSchema);