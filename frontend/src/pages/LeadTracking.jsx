import { useState, useEffect } from "react";
import { BarChart3, Plus, Upload, Trash2, Edit, Copy, Check } from "lucide-react";
import {
  FaTiktok, FaInstagram, FaYoutube, FaFacebook,
  FaTwitter, FaLinkedin, FaSnapchat,
  FaPinterest, FaReddit, FaThreads
} from "react-icons/fa6";
import api from "../services/api";
import Modal from "../components/Modal"; 
import FormInput from "../components/FormInput"; 
import Button from "../components/Button"; 

// Helper function to convert image file to Base64 String
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

function LeadTracking() {
  const [stats, setStats] = useState([]);
  const [customPlatforms, setCustomPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  
  // Manage hidden default platforms in local memory
  const [hiddenDefaults, setHiddenDefaults] = useState(() => {
    const saved = localStorage.getItem("hiddenDefaults");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("hiddenDefaults", JSON.stringify(hiddenDefaults));
  }, [hiddenDefaults]);
  
  // Modal & Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditingPlatform, setIsEditingPlatform] = useState(false);
  const [currentPlatformId, setCurrentPlatformId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const defaultPlatforms = [
    { name: "TikTok", id: "tiktok", icon: FaTiktok, color: "text-black", bg: "bg-gray-200" },
    { name: "Instagram", id: "instagram", icon: FaInstagram, color: "text-pink-600", bg: "bg-pink-100" },
    { name: "YouTube", id: "youtube", icon: FaYoutube, color: "text-red-600", bg: "bg-red-100" },
    { name: "Facebook", id: "facebook", icon: FaFacebook, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Twitter", id: "twitter", icon: FaTwitter, color: "text-blue-400", bg: "bg-blue-50" },
    { name: "LinkedIn", id: "linkedin", icon: FaLinkedin, color: "text-blue-800", bg: "bg-blue-100" },
    { name: "Snapchat", id: "snapchat", icon: FaSnapchat, color: "text-yellow-500", bg: "bg-yellow-100" },
    { name: "Pinterest", id: "pinterest", icon: FaPinterest, color: "text-red-500", bg: "bg-red-100" },
    { name: "Reddit", id: "reddit", icon: FaReddit, color: "text-orange-500", bg: "bg-orange-100" },
    { name: "Threads", id: "threads", icon: FaThreads, color: "text-black", bg: "bg-gray-200" }
  ];

  const visibleDefaults = defaultPlatforms.filter(p => !hiddenDefaults.includes(p.id));
  const availableDefaultsToRestore = defaultPlatforms.filter(p => hiddenDefaults.includes(p.id));

  const allPlatforms = [
    ...visibleDefaults,
    ...customPlatforms.map(p => ({
      _id: p._id,
      name: p.name,
      id: p.name.toLowerCase().replace(/\s+/g, '-'),
      icon: p.icon, 
      color: "text-gray-800",
      bg: "bg-gray-100",
      isCustom: true
    }))
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, platformsRes] = await Promise.all([
        api.get("/leads/stats"),
        api.get("/platforms").catch(() => ({ data: [] })) 
      ]);
      setStats(statsRes.data);
      setCustomPlatforms(platformsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCount = (platformId) => {
    if (!stats || stats.length === 0) return 0;
    
    // Clean the React platform ID
    const cleanPlatformId = String(platformId).toLowerCase().trim();

    // Look for a matching clean string from the backend
    const found = stats.find((s) => {
      if (!s._id) return false;
      const dbPlatform = String(s._id).toLowerCase().trim();
      return dbPlatform === cleanPlatformId;
    });

    return found ? found.count : 0;
  };

  // ✅ UPDATED: Now copies the backend localhost:5000 API link
  const handleCopyLink = (platformName, id) => {
    const cleanName = platformName.toLowerCase().replace(/\s+/g, '');
    const trackingUrl = `http://localhost:5000/api/leads/track/${cleanName}`;
    navigator.clipboard.writeText(trackingUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSavePlatform = async (e) => {
    e.preventDefault();

    try {
      let iconBase64 = null;
      if (newImageFile) {
        iconBase64 = await toBase64(newImageFile);
      }

      // Build JSON payload instead of FormData
      const payload = { name: newName };
      if (iconBase64) payload.icon = iconBase64;

      if (isEditingPlatform) {
        await api.put(`/platforms/${currentPlatformId}`, payload);
      } else {
        if (!iconBase64) return alert("Icon image is required for new platforms!");
        await api.post("/platforms", payload);
      }
      
      fetchData(); 
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
  };

  const handleDeletePlatform = async (platform) => {
    if (!window.confirm(`Remove ${platform.name}?`)) return;
    if (platform.isCustom) {
      await api.delete(`/platforms/${platform._id}`);
      fetchData();
    } else {
      setHiddenDefaults([...hiddenDefaults, platform.id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative p-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          Marketing Channel Performance
        </h2>
        <p className="text-gray-500 mt-1">Manage engagement stats and tracking links.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allPlatforms.map((platform) => (
          <div key={platform.id} className="bg-white p-5 rounded-xl shadow border flex flex-col justify-between hover:shadow-lg transition relative group">
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-white/90 p-1 rounded shadow-sm">
              <button 
                onClick={() => handleCopyLink(platform.name, platform.id)} 
                className={`p-1 ${copiedId === platform.id ? 'text-green-500' : 'hover:text-blue-600'}`}
                title="Copy tracking link"
              >
                {copiedId === platform.id ? <Check size={14}/> : <Copy size={14}/>}
              </button>
              {platform.isCustom && (
                <button onClick={() => {
                  setIsEditingPlatform(true);
                  setCurrentPlatformId(platform._id);
                  setNewName(platform.name);
                  setImagePreviewUrl(platform.icon); // Load base64 preview
                  setShowAddModal(true);
                }} className="p-1 hover:text-blue-600"><Edit size={14}/></button>
              )}
              <button onClick={() => handleDeletePlatform(platform)} className="p-1 hover:text-red-600"><Trash2 size={14}/></button>
            </div>

            <div className="flex justify-between items-start mb-2 mt-2">
              <p className="text-gray-500 font-medium text-sm truncate pr-2">{platform.name}</p>
              <div className={`${platform.bg} p-2 rounded-lg ${platform.color} h-10 w-10 flex items-center justify-center overflow-hidden`}>
                {platform.isCustom ? <img src={platform.icon} className="w-full h-full object-contain" alt=""/> : <platform.icon size={18} />}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">
              {loading ? "..." : getCount(platform.id)}
            </h3>
          </div>
        ))}

        <button onClick={() => { setIsEditingPlatform(false); setNewName(""); setImagePreviewUrl(null); setNewImageFile(null); setShowAddModal(true); }} className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition min-h-[130px]">
          <Plus size={32} className="mb-2" />
          <span className="font-medium text-sm">Add Platform</span>
        </button>
      </div>

      <div className="bg-[#213588] text-white p-6 rounded-xl shadow-md mt-8">
        <h3 className="font-bold text-lg mb-1 text-white">Manager Tip</h3>
        <p className="text-sm text-blue-100">Hover over any card to get the short tracking link for that platform.</p>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="p-2">
          <h2 className="text-xl font-bold mb-6">{isEditingPlatform ? "Edit Platform" : "Add Platform"}</h2>
          
          {!isEditingPlatform && availableDefaultsToRestore.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Restore & Copy Links</h3>
              <div className="flex flex-col gap-2">
                {availableDefaultsToRestore.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <p.icon className={p.color} size={16} />
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleCopyLink(p.name, p.id)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
                            {copiedId === p.id ? <Check size={12}/> : <Copy size={12}/>} Copy Link
                        </button>
                        <button onClick={() => setHiddenDefaults(hiddenDefaults.filter(id => id !== p.id))} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSavePlatform} className="space-y-6">
            <FormInput label="Platform Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <div>
              <label className="block text-sm font-bold mb-2">Icon Logo</label>
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-gray-50">
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  {imagePreviewUrl ? <img src={imagePreviewUrl} className="h-full object-contain p-2" alt=""/> : <Upload className="text-gray-400"/>}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            <Button text={isEditingPlatform ? "Update" : "Create Custom"} type="submit" className="w-full bg-blue-600 text-white" />
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default LeadTracking;