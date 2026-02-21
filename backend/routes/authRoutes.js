const express = require("express");
const router = express.Router();

const { login, register } = require("../controllers/authController");

// Admin + User login
router.post("/login", login);

// User registration
router.post("/register", register);

module.exports = router;