import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const Guidelines = () => {
  const [dos, setDos] = useState([]); // Mongo docs: [{ _id, text, type, ... }]
  const [donts, setDonts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newGuideline, setNewGuideline] = useState("");
  const [type, setType] = useState("do");

  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [saving, setSaving] = useState(false);

  // -------- API calls --------
  const fetchGuidelines = async () => {
    const res = await axios.get(`${API_BASE}/guidelines`);

    // Backend returns an array: [{ _id, text, type: "do"|"dont", ... }]
    const list = Array.isArray(res.data) ? res.data : [];

    setDos(list.filter((g) => g.type === "do"));
    setDonts(list.filter((g) => g.type === "dont"));
  };

  const addGuidelineApi = async (type, text) => {
    const res = await axios.post(`${API_BASE}/guidelines`, { type, text });
    return res.data; // created Mongo document (has _id)
  };

  const updateGuidelineApi = async (id, text) => {
    await axios.put(`${API_BASE}/guidelines/${id}`, { text });
  };

  const deleteGuidelineApi = async (id) => {
    await axios.delete(`${API_BASE}/guidelines/${id}`);
  };

  // -------- load on mount --------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchGuidelines();
      } catch (e) {
        console.error(e);
        alert("Failed to load guidelines.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------- actions --------
  const handleAdd = async () => {
    if (!newGuideline.trim()) return;

    setSaving(true);
    try {
      const created = await addGuidelineApi(type, newGuideline.trim());

      // created has _id and type
      if (created.type === "do") setDos((prev) => [...prev, created]);
      else setDonts((prev) => [...prev, created]);

      setNewGuideline("");
    } catch (e) {
      console.error(e);
      alert("Failed to add guideline.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, listType) => {
    setSaving(true);
    try {
      await deleteGuidelineApi(id);

      if (listType === "do") setDos((prev) => prev.filter((g) => g._id !== id));
      else setDonts((prev) => prev.filter((g) => g._id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete guideline.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStart = (id, listType, value) => {
    setEditId(id);
    setEditType(listType);
    setEditValue(value);
  };

  const resetEdit = () => {
    setEditId(null);
    setEditType(null);
    setEditValue("");
  };

  const handleEditSave = async () => {
    if (!editValue.trim()) return;

    setSaving(true);
    try {
      await updateGuidelineApi(editId, editValue.trim());

      if (editType === "do") {
        setDos((prev) =>
          prev.map((g) => (g._id === editId ? { ...g, text: editValue.trim() } : g))
        );
      } else {
        setDonts((prev) =>
          prev.map((g) => (g._id === editId ? { ...g, text: editValue.trim() } : g))
        );
      }

      resetEdit();
    } catch (e) {
      console.error(e);
      alert("Failed to update guideline.");
    } finally {
      setSaving(false);
    }
  };

  // -------- small UI helpers --------
  const cardClass = "bg-white rounded-xl shadow-sm border border-gray-100";
  const headerClass =
    "px-4 py-3 border-b border-gray-100 flex items-center justify-between";
  const titleClass = "text-sm font-semibold";
  const btnPrimary =
    "rounded-lg px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60";
  const btnDanger =
    "text-xs px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-60";
  const btnWarn =
    "text-xs px-2 py-1 rounded-md bg-amber-500/90 hover:bg-amber-600 text-white disabled:opacity-60";

  const Row = ({ item, onEdit, onDelete }) => (
    <li className="flex items-start justify-between gap-3 py-2">
      <span className="text-sm text-gray-800 leading-snug">{item.text}</span>
      <div className="flex gap-2 shrink-0">
        <button disabled={saving} onClick={onEdit} className={btnWarn}>
          Edit
        </button>
        <button disabled={saving} onClick={onDelete} className={btnDanger}>
          Delete
        </button>
      </div>
    </li>
  );

  return (
    <div className="p-4">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-900">Content Guidelines</h1>
        <p className="text-sm text-gray-500">Data is loaded/saved from backend.</p>
      </div>

      {/* Add */}
      <div className={`${cardClass} p-4 mb-4`}>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Add new guideline
        </h2>

        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="do">Do&apos;s</option>
            <option value="dont">Don&apos;ts</option>
          </select>

          <input
            type="text"
            value={newGuideline}
            onChange={(e) => setNewGuideline(e.target.value)}
            placeholder="Enter guideline..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <button disabled={saving} onClick={handleAdd} className={btnPrimary}>
            {saving ? "Saving..." : "Add"}
          </button>
        </div>
      </div>

      {/* Lists */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className={cardClass}>
          <div className={headerClass}>
            <h2 className={`${titleClass} text-green-700`}>Do&apos;s</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {dos.map((g) => (
                  <Row
                    key={g._id}
                    item={g}
                    onEdit={() => handleEditStart(g._id, "do", g.text)}
                    onDelete={() => handleDelete(g._id, "do")}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <div className={headerClass}>
            <h2 className={`${titleClass} text-red-700`}>Don&apos;ts</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {donts.map((g) => (
                  <Row
                    key={g._id}
                    item={g}
                    onEdit={() => handleEditStart(g._id, "dont", g.text)}
                    onDelete={() => handleDelete(g._id, "dont")}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={resetEdit} />

          <div className="relative z-10 w-[92%] max-w-md bg-white rounded-xl shadow-lg border border-gray-100">
            <div className={headerClass}>
              <h2 className="text-sm font-semibold text-gray-900">Edit guideline</h2>
              <button
                onClick={resetEdit}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={resetEdit}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-3 py-2 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guidelines;
