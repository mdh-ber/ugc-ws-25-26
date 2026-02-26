import React, { useState, useEffect, useRef } from "react";
import { getFeed, createPost } from "../services/postService";
import PostCard from "../components/PostCard";
import { Image as ImageIcon } from "lucide-react";

// Helper function to turn an image file into a Base64 text string
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getFeed(sortBy);
      if (res.success) setPosts(res.posts);
    } catch (error) {
      console.error("Failed to fetch feed", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const handleMediaClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: Check file size so we don't overwhelm the basic backend (e.g., limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large! Please select an image under 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setIsPosting(true);

    const tagsArray = hashtags.split(",")
      .map(tag => tag.trim().replace("#", ""))
      .filter(tag => tag.length > 0);

    try {
      let realMediaUrl = null;
      
      // If the user selected a file, convert it to Base64
      if (selectedFile) {
        realMediaUrl = await convertToBase64(selectedFile);
      }

      const res = await createPost({
        caption,
        hashtags: tagsArray,
        mediaType: selectedFile ? "image" : "none", 
        mediaUrl: realMediaUrl // Sending the real image as a Base64 string!
      });
      
      if (res.success) {
        setCaption("");
        setHashtags("");
        setSelectedFile(null); 
        
        if (sortBy === "newest") {
          setPosts([res.post, ...posts]);
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please check your backend terminal for errors!");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Community Feed</h1>
        <select 
          className="border rounded-lg px-3 py-2 bg-white text-gray-700 outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleCreatePost}>
          <textarea
            className="w-full border-none outline-none resize-none text-gray-700 text-lg placeholder-gray-400"
            rows="3"
            placeholder="Share your UGC tips, wins, or ask a question..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          ></textarea>
          
          <input 
            type="text" 
            placeholder="Hashtags (comma separated: ugc, tips, wins)"
            className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-400"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
          />

          {selectedFile && (
            <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded flex justify-between">
              <span>Attached: {selectedFile.name}</span>
              <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 font-bold">X</button>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <button 
              type="button" 
              onClick={handleMediaClick}
              className="text-gray-500 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <ImageIcon size={20} />
              <span className="font-medium text-sm">Media</span>
            </button>
            
            <button 
              type="submit" 
              disabled={!caption.trim() || isPosting}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No posts yet. Be the first to share!</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommunityFeed;