import express from "express";
const router = express.Router();

import { login, register } from "../controllers/authController.js";

// Admin + User login
router.post("/login", login);

// User registration
router.post("/register", register);

export default router;

module.exports = router;