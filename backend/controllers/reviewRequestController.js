// In-memory store (temporary until DB is ready)
const { randomUUID } = require("crypto");

const reviewRequests = [];

// Use UUID for unique IDs
const generateId = () => randomUUID();

const allowedStatuses = ["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"];

const transitions = {
  SUBMITTED: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

const createReviewRequest = (req, res) => {
  const { creatorId, title, description, contentUrl } = req.body;

  if (!creatorId || !title || !contentUrl) {
    return res.status(400).json({
      message: "creatorId, title, and contentUrl are required",
    });
  }

  const newRequest = {
    id: generateId(),
    creatorId,
    title,
    description: description || "",
    contentUrl,
    status: "SUBMITTED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reviewRequests.push(newRequest);
  return res.status(201).json(newRequest);
};

const getAllReviewRequests = (req, res) => {
  const { creatorId, status } = req.query;

  let result = [...reviewRequests];

  if (creatorId) result = result.filter((r) => r.creatorId === creatorId);
  if (status) result = result.filter((r) => r.status === status);

  return res.status(200).json(result);
};

const getReviewRequestById = (req, res) => {
  const { id } = req.params;

  const found = reviewRequests.find((r) => r.id === id);
  if (!found) return res.status(404).json({ message: "Review request not found" });

  return res.status(200).json(found);
};

const updateReviewRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: `status must be one of: ${allowedStatuses.join(", ")}`,
    });
  }

  const found = reviewRequests.find((r) => r.id === id);
  if (!found) return res.status(404).json({ message: "Review request not found" });

  if (!transitions[found.status].includes(status)) {
    return res.status(409).json({
      message: `Invalid status transition from ${found.status} to ${status}`,
    });
  }

  found.status = status;
  found.updatedAt = new Date().toISOString();

  return res.status(200).json(found);
};

module.exports = {
  createReviewRequest,
  getAllReviewRequests,
  getReviewRequestById,
  updateReviewRequestStatus,
};
