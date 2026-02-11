const express = require("express");
const router = express.Router();
const { getTrainings, addTrainings } = require("../controllers/trainingController");

router.get("/", getTrainings);
router.post("/", addTrainings);

module.exports = router;
