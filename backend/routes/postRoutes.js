const express = require("express");
const router = express.Router();
const { 
  createPost, 
  getFeed, 
  toggleLike, 
  addComment, 
  getComments, 
  reportPost 
} = require("../controllers/postController");

// Import your existing auth middleware
const auth = require("../middleware/auth"); 

// Feed & Post Creation
router.post("/", auth, createPost);
router.get("/", auth, getFeed);

// Interactions
router.post("/:id/like", auth, toggleLike);
router.post("/:id/report", auth, reportPost);

// Comments
router.post("/:id/comment", auth, addComment);
router.get("/:id/comment", auth, getComments);

module.exports = router;