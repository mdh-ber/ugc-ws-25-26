const express = require("express");
const router = express.Router();
const multer = require("multer");

// Setup Multer to catch the image file
const upload = multer({ storage: multer.memoryStorage() });

const { 
  getPlatforms, 
  createPlatform, 
  updatePlatform, 
  deletePlatform 
} = require("../controllers/platformController");

router.get("/", getPlatforms);
// upload.any() catches the image file and attaches it to req.files
router.post("/", upload.any(), createPlatform);
router.put("/:id", upload.any(), updatePlatform);
router.delete("/:id", deletePlatform);

module.exports = router;