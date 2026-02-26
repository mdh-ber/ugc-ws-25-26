import React, { useState } from "react";
import { ThumbsUp, MessageSquare, Flag, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { toggleLike, addComment, getComments, reportPost, deletePost } from "../services/postService";

function PostCard({ post, currentUserId }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [hasLiked, setHasLiked] = useState(post.likes?.includes(currentUserId));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  // NEW: State to control the 3-dots dropdown menu
  const [showOptions, setShowOptions] = useState(false);

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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post._id);
        alert("Post deleted!");
        window.location.reload(); 
      } catch (error) {
        console.error("Error deleting post:", error);
      }
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post!',
          text: post.caption,
          url: window.location.href,
        });
      } catch (error) {
        console.log('User cancelled share or error:', error);
      }
    } else {
      navigator.clipboard.writeText(post.caption);
      alert("Post text copied to your clipboard!");
    }
  };

  const postDate = new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.2)] mb-4 overflow-hidden">
      
      {/* Post Header */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:opacity-90">
            {post.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h4 className="font-semibold text-[15px] text-gray-900 cursor-pointer hover:underline">
              {post.user?.name || "Unknown User"}
            </h4>
            <span className="text-[13px] text-gray-500 hover:underline cursor-pointer">
              {postDate}
            </span>
          </div>
        </div>
        
        {/* UPDATED: Options Dropdown Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)} 
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-10 animate-fade-in">
              <button 
                onClick={() => {
                  setShowOptions(false);
                  handleReport();
                }} 
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium transition-colors"
              >
                <Flag size={16} className="text-gray-500" />
                Report Post
              </button>
              
              <button 
                onClick={() => {
                  setShowOptions(false);
                  handleDelete();
                }} 
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors border-t border-gray-50"
              >
                <Trash2 size={16} />
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Text & Hashtags */}
      <div className="px-4 pb-3">
        <p className="text-[15px] text-gray-900 whitespace-pre-wrap">{post.caption}</p>
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map((tag, idx) => (
              <span key={idx} className="text-blue-600 hover:underline cursor-pointer text-[15px]">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.mediaUrl && post.mediaType === "image" && (
        <div className="w-full bg-gray-100 border-y border-gray-100">
          <img src={post.mediaUrl} alt="Post media" className="w-full max-h-[500px] object-contain mx-auto" />
        </div>
      )}

      {/* Stats Line */}
      <div className="px-4 py-2.5 flex justify-between text-[13px] text-gray-500 border-b border-gray-200/60 mx-4">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          {likes > 0 && (
            <>
              <div className="bg-blue-600 p-1 rounded-full text-white">
                <ThumbsUp size={10} fill="currentColor" />
              </div>
              <span>{likes}</span>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <span className="cursor-pointer hover:underline" onClick={loadComments}>
            {comments.length > 0 ? `${comments.length} comments` : ''}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex justify-between items-center text-gray-600 font-semibold text-[15px]">
        <button 
          onClick={handleLike} 
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors ${hasLiked ? "text-blue-600" : ""}`}
        >
          <ThumbsUp size={20} fill={hasLiked ? "currentColor" : "none"} />
          <span>Like</span>
        </button>
        <button 
          onClick={loadComments} 
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <MessageSquare size={20} />
          <span>Comment</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pt-2 pb-4">
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4 items-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm mt-1">
              {post.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 bg-gray-100 rounded-2xl flex items-center pr-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent px-4 py-2.5 focus:outline-none text-[15px]"
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="text-blue-600 font-semibold p-2 disabled:opacity-50 hover:bg-gray-200 rounded-full transition-colors"
              >
                Post
              </button>
            </div>
          </form>

          <div className="space-y-3 pl-10">
            {comments.map((comment) => (
              <div key={comment._id} className="group flex items-start gap-2">
                <div className="bg-gray-100 px-3.5 py-2 rounded-2xl max-w-[85%]">
                  <span className="font-semibold text-[13px] block text-gray-900 cursor-pointer hover:underline">
                    {comment.user?.name || "User"}
                  </span>
                  <span className="text-gray-800 text-[15px]">{comment.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;