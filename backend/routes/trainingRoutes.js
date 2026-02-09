const express = require("express");
const router = express.Router();
const { getTrainings } = require("../controllers/trainingController");

router.get("/", getTrainings);

module.exports = router;
