import express from "express";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

// Admin + User login
router.post("/login", login);

// User registration
router.post("/register", register);

export default router;