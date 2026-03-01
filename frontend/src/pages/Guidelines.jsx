import { useState, useEffect } from "react";
import api from "../services/api"; 

const Guidelines = () => {
  // --- STATE ---
  const [dos, setDos] = useState([]);
  const [donts, setDonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newGuideline, setNewGuideline] = useState("");
  const [type, setType] = useState("do");

  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editValue, setEditValue] = useState("");

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/guidelines");
        // Filter guidelines into respective categories
        setDos(data.filter((g) => g.type === "do"));
        setDonts(data.filter((g) => g.type === "dont"));
      } catch (error) {
        console.error("Error fetching guidelines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelines();
  }, []);

  // --- ACTIONS ---
  const handleAdd = async () => {
    if (!newGuideline.trim()) return;
    setSaving(true);
    try {
      const { data: created } = await api.post("/guidelines", {
        text: newGuideline.trim(),
        type: type,
      });
      if (type === "do") setDos([...dos, created]);
      else setDonts([...donts, created]);
      setNewGuideline("");
    } catch (err) {
      console.error("Add failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, listType) => {
    if (!window.confirm("Delete this guideline?")) return;
    try {
      await api.delete(`/guidelines/${id}`);
      if (listType === "do") setDos(dos.filter((g) => g._id !== id));
      else setDonts(donts.filter((g) => g._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEditStart = (item) => {
    setEditId(item._id);
    setEditType(item.type);
    setEditValue(item.text);
  };

  const handleEditSave = async () => {
    if (!editValue.trim()) return;
    setSaving(true);
    try {
      await api.put(`/guidelines/${editId}`, {
        text: editValue.trim(),
        type: editType,
      });
      const update = (list) => list.map((g) => (g._id === editId ? { ...g, text: editValue } : g));
      if (editType === "do") setDos((prev) => update(prev));
      else setDonts((prev) => update(prev));
      resetEdit();
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const resetEdit = () => {
    setEditId(null);
    setEditType(null);
    setEditValue("");
  };

  // --- STYLES ---
  const btnPrimary = "rounded-lg px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50";
  const btnDanger = "text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white";
  const btnWarn = "text-xs px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Guidelines</h1>
        <p className="text-sm text-gray-500">Manage rules for content creation.</p>
      </div>

      {/* INPUT */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-gray-50">
          <option value="do">Do's</option>
          <option value="dont">Don'ts</option>
        </select>
        <input
          type="text"
          value={newGuideline}
          onChange={(e) => setNewGuideline(e.target.value)}
          placeholder="New rule..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button disabled={saving} onClick={handleAdd} className={btnPrimary}>
          {saving ? "Saving..." : "Add"}
        </button>
      </div>

      {/* LISTS */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <h2 className="font-bold text-green-800 mb-3">✅ Do's</h2>
            <ul className="space-y-2">
              {dos.map((item) => (
                <li key={item._id} className="flex justify-between items-start bg-white p-2 rounded shadow-sm">
                  <span className="text-sm text-gray-700">{item.text}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditStart(item)} className={btnWarn}>Edit</button>
                    <button onClick={() => handleDelete(item._id, "do")} className={btnDanger}>X</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h2 className="font-bold text-red-800 mb-3">❌ Don'ts</h2>
            <ul className="space-y-2">
              {donts.map((item) => (
                <li key={item._id} className="flex justify-between items-start bg-white p-2 rounded shadow-sm">
                  <span className="text-sm text-gray-700">{item.text}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditStart(item)} className={btnWarn}>Edit</button>
                    <button onClick={() => handleDelete(item._id, "dont")} className={btnDanger}>X</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* MODAL */}
      {editId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="font-bold mb-4">Edit Rule</h3>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={resetEdit} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guidelines;