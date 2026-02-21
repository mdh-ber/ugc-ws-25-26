const express = require("express");
const router = express.Router();
const { getReferals, addReferals, getReferalById, updateReferal, deleteReferal
   } = require("../controllers/referalController");

// Referal routes
router.get("/", getReferals);
router.get("/:id", getReferalById);
router.post("/", addReferals);
router.put("/:id", updateReferal);
router.delete("/:id", deleteReferal);

module.exports = router;
