import { useState } from "react";

function getToken() {
  return localStorage.getItem("token"); // adjust if you store token differently
}

export default function SubmitReviewForm({ onDone, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [contentType, setContentType] = useState("Short");
  const [mediaUrl, setMediaUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!title.trim()) return alert("Title is required");
    if (!platform.trim()) return alert("Platform is required");
    if (!contentType.trim()) return alert("Content type is required");
    if (!mediaUrl.trim()) return alert("Media URL is required");

    const token = getToken();
    if (!token) return alert("You are not logged in (missing token)");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          platform,
          contentType,
          notes,
          media: [{ url: mediaUrl, type: "VIDEO" }],
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Submit failed");
        return;
      }

      onCreated?.(data);
      onDone?.();
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="text-sm font-semibold">Title</label>
        <input
          className="mt-1 w-full border rounded-lg p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. TikTok Draft - Hook Test"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Description</label>
        <textarea
          className="mt-1 w-full border rounded-lg p-2"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this content about?"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Platform</label>
          <select
            className="mt-1 w-full border rounded-lg p-2"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="TikTok">TikTok</option>
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube</option>
            <option value="Facebook">Facebook</option>
            <option value="X">X</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Content Type</label>
          <select
            className="mt-1 w-full border rounded-lg p-2"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="Short">Short</option>
            <option value="Reel">Reel</option>
            <option value="Post">Post</option>
            <option value="Story">Story</option>
            <option value="Long-form">Long-form</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">Media URL</label>
        <input
          className="mt-1 w-full border rounded-lg p-2"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://drive.google.com/... or https://..."
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Notes for reviewer</label>
        <textarea
          className="mt-1 w-full border rounded-lg p-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What feedback do you want?"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          onClick={onDone}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}