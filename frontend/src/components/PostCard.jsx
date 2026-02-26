import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Flag, MoreHorizontal } from "lucide-react";
import { toggleLike, addComment, getComments, reportPost } from "../services/postService";

function PostCard({ post, currentUserId }) {
  const [likes, setLikes] = useState(post.likes.length);
  const [hasLiked, setHasLiked] = useState(post.likes.includes(currentUserId));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleLike = async () => {
    try {
      const res = await toggleLike(post._id);
      setLikes(res.likes);
      setHasLiked(res.hasLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleReport = async () => {
    if (window.confirm("Are you sure you want to report this post?")) {
      await reportPost(post._id);
      alert("Post reported to admins.");
    }
  };

  const loadComments = async () => {
    if (!showComments && comments.length === 0) {
      const res = await getComments(post._id);
      setComments(res.comments);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await addComment(post._id, newComment);
      setComments([res.comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
      {/* Post Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {post.user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{post.user?.name || "Unknown User"}</h4>
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button onClick={handleReport} className="text-gray-400 hover:text-red-500" title="Report Post">
          <Flag size={18} />
        </button>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.caption}</p>
      
      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags.map((tag, idx) => (
            <span key={idx} className="text-blue-600 text-sm font-medium">#{tag}</span>
          ))}
        </div>
      )}

      {/* Media (If any) */}
      {post.mediaUrl && post.mediaType === "image" && (
        <img src={post.mediaUrl} alt="Post media" className="rounded-lg w-full max-h-96 object-cover mb-4" />
      )}

      {/* Interaction Bar */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 font-medium ${hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
        >
          <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
          <span>{likes}</span>
        </button>
        <button 
          onClick={loadComments} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500 font-medium"
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              Post
            </button>
          </form>

          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-sm block text-gray-800">{comment.user?.name}</span>
                <span className="text-gray-700 text-sm">{comment.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;