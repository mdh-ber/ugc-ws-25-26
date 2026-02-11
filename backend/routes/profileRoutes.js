const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const profileController = require("../controllers/profileController");
const upload = require("../middleware/upload");
router.get("/", auth, profileController.getProfile);
router.put("/", auth, upload.single("profilePic"), profileController.updateProfile);
module.exports = router;
