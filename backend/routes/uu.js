const express = require("express");
const router = express.Router();

// NEW: Referral users list (dummy data)
router.get("/referral/users", (req, res) => {
  const days = Number(req.query.days || 7);

  return res.json({
    users: [
      { id: "1", name: "John", email: "john@test.com", date: "2026-02-15" },
      { id: "2", name: "Sara", email: "sara@test.com", date: "2026-02-14" },
    ],
    days,
  });
});

// NEW: Referee users list (dummy data)
router.get("/referee/users", (req, res) => {
  const days = Number(req.query.days || 7);

  return res.json({
    users: [{ id: "3", name: "Adam", email: "adam@test.com", date: "2026-02-15" }],
    days,
  });
});

module.exports = router;
