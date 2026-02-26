import React, { useState, useEffect, useRef } from "react";
import { getFeed, createPost } from "../services/postService";
import PostCard from "../components/PostCard";
import { Image as ImageIcon, Smile } from "lucide-react";

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

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  
  // NEW: State to control the feelings dropdown menu
  const [showFeelingsMenu, setShowFeelingsMenu] = useState(false);
  
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id;
  const currentUserName = currentUser.name || currentUser.firstName || "User";

  // NEW: Array of feeling options
  const feelingOptions = [
    { emoji: "😊", text: "Happy" },
    { emoji: "🤩", text: "Excited" },
    { emoji: "🚀", text: "Motivated" },
    { emoji: "😌", text: "Relaxed" },
    { emoji: "🙌", text: "Grateful" },
    { emoji: "🎨", text: "Creative" },
    { emoji: "🤔", text: "Thoughtful" },
    { emoji: "🎉", text: "Celebrating" },
  ];

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

  // NEW: Toggle the menu open/closed
  const toggleFeelingsMenu = () => {
    setShowFeelingsMenu(!showFeelingsMenu);
  };

  // NEW: Add the selected feeling to the text box and close the menu
  const selectFeeling = (feeling) => {
    setCaption((prev) => prev + (prev.length > 0 ? "\n\n" : "") + ` ${feeling.emoji} feeling ${feeling.text.toLowerCase()}`);
    setShowFeelingsMenu(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large! Please select an image under 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !selectedFile) return;

    setIsPosting(true);

    const tagsArray = hashtags.split(",")
      .map(tag => tag.trim().replace("#", ""))
      .filter(tag => tag.length > 0);

    try {
      let realMediaUrl = null;
      if (selectedFile) {
        realMediaUrl = await convertToBase64(selectedFile);
      }

      const res = await createPost({
        caption,
        hashtags: tagsArray,
        mediaType: selectedFile ? "image" : "none", 
        mediaUrl: realMediaUrl
      });
      
      if (res.success) {
        setCaption("");
        setHashtags("");
        setSelectedFile(null); 
        setShowFeelingsMenu(false); // Make sure menu closes after posting
        
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
    <div className="bg-[#f0f2f5] min-h-screen -mt-6 -mx-6 p-6">
      <div className="max-w-[680px] mx-auto pt-4">
        
        <div className="flex justify-between items-center mb-4 px-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Community</h1>
          <select 
            className="bg-transparent text-gray-600 font-semibold cursor-pointer outline-none hover:bg-gray-200 px-2 py-1 rounded-md transition-colors text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Recent</option>
            <option value="popular">Top Posts</option>
          </select>
        </div>

        {/* Create Post Module */}
        <div className="bg-white p-4 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.2)] mb-4 relative">
          <form onSubmit={handleCreatePost}>
            
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              <textarea
                className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white transition-colors border-none rounded-2xl outline-none resize-none text-gray-900 text-[17px] placeholder-gray-500 px-4 py-2"
                rows="2"
                placeholder={`What's on your mind, ${currentUserName}?`}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              ></textarea>
            </div>
            
            {(caption.length > 0 || selectedFile) && (
              <div className="ml-13 mb-3 animate-fade-in">
                <input 
                  type="text" 
                  placeholder="Add hashtags (comma separated: ugc, wins)..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-blue-400"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>
            )}

            {selectedFile && (
              <div className="relative mt-2 mb-3 bg-gray-50 rounded-lg p-2 border border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setSelectedFile(null)} 
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 text-gray-600"
                >
                  ✕
                </button>
                <p className="text-sm text-gray-600 truncate px-2 font-medium">📷 {selectedFile.name}</p>
              </div>
            )}

            {/* NEW: The Feelings Dropdown Menu */}
            {showFeelingsMenu && (
              <div className="absolute bottom-[70px] right-4 bg-white border border-gray-200 shadow-lg rounded-xl p-2 z-10 w-64 grid grid-cols-2 gap-1 animate-fade-in">
                {feelingOptions.map((feeling, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectFeeling(feeling)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-left text-sm font-medium text-gray-700 transition-colors"
                  >
                    <span className="text-xl">{feeling.emoji}</span>
                    <span>{feeling.text}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-200/60">
              <div className="flex gap-1 w-full justify-around sm:justify-start sm:w-auto relative">
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors font-semibold text-[15px]"
                >
                  <ImageIcon size={24} className="text-green-500" />
                  <span>Photo/video</span>
                </button>

                <button 
                  type="button" 
                  onClick={toggleFeelingsMenu}
                  className={`hidden sm:flex flex-1 items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors font-semibold text-[15px] ${showFeelingsMenu ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <Smile size={24} className="text-yellow-500" />
                  <span>Feeling/activity</span>
                </button>
              </div>
              
              <button 
                type="submit" 
                disabled={(!caption.trim() && !selectedFile) || isPosting}
                className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold text-[15px] hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors ml-auto sm:ml-0"
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Layout */}
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-semibold">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No posts yet. Be the first to share!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}

export default CommunityFeed;