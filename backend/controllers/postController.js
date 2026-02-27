const Post = require("../models/Post");
const Comment = require("../models/Comment");

// =============================
// Create a new Post
// =============================
exports.createPost = async (req, res) => {
  try {
    const { caption, mediaUrl, mediaType, hashtags } = req.body;

    const newPost = new Post({
      user: req.user.id, // Comes from auth middleware
      caption,
      mediaUrl,
      mediaType,
      hashtags: hashtags || [],
    });

    await newPost.save();
    
    // Populate user info before sending back
    await newPost.populate("user", "name avatar");

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// Get Feed (with sorting and pagination)
// =============================
exports.getFeed = async (req, res) => {
  try {
    const { sort = "newest", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Determine sorting logic
    let sortQuery = { createdAt: -1 }; // Default: Newest
    if (sort === "popular") {
      sortQuery = { likes: -1, createdAt: -1 }; // Sort by likes array size (mongoose handles this dynamically or you can aggregate)
    }

    const posts = await Post.find()
      .populate("user", "name avatar") // Get creator details
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// Toggle Like on a Post
// =============================
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Remove like
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Add like
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ success: true, likes: post.likes.length, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// Add a Comment
// =============================
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const newComment = new Comment({
      post: req.params.id,
      user: req.user.id,
      text,
    });

    await newComment.save();
    await newComment.populate("user", "name avatar");

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// Get Comments for a Post
// =============================
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// Report a Post
// =============================
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.reportCount += 1;
    await post.save();

    res.status(200).json({ success: true, message: "Post reported to admins" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};