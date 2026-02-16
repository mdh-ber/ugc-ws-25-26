import { useState } from "react";

const Guidelines = () => {
  const [dos, setDos] = useState([
    "Follow university branding rules",
    "Use clear audio and video",
    "Be respectful and professional",
  ]);

  const [donts, setDonts] = useState([
    "Do not post offensive content",
    "Do not share private information",
    "Do not violate copyright rules",
  ]);

  const [newGuideline, setNewGuideline] = useState("");
  const [type, setType] = useState("dos");

  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editValue, setEditValue] = useState("");

  // ADD
  const handleAdd = () => {
    if (!newGuideline.trim()) return;

    if (type === "do") {
      setDos([...dos, newGuideline]);
    } else {
      setDonts([...donts, newGuideline]);
    }

    setNewGuideline("");
  };

  // DELETE
  const handleDelete = (index, listType) => {
    if (listType === "do") {
      setDos(dos.filter((_, i) => i !== index));
    } else {
      setDonts(donts.filter((_, i) => i !== index));
    }
  };

  // START EDIT
  const handleEditStart = (index, listType, value) => {
    setEditIndex(index);
    setEditType(listType);
    setEditValue(value);
  };

  // SAVE EDIT
  const handleEditSave = () => {
    if (!editValue.trim()) return;

    if (editType === "do") {
      const updated = [...dos];
      updated[editIndex] = editValue;
      setDos(updated);
    } else {
      const updated = [...donts];
      updated[editIndex] = editValue;
      setDonts(updated);
    }

    setEditIndex(null);
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
            <option value="do">Do's</option>
            <option value="dont">Don'ts</option>
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

      {/* DO'S */}
      <h2 className="text-xl font-semibold mt-4">Do's</h2>
      <ul className="list-disc ml-6">
        {dos.map((item, index) => (
          <li key={index} className="mb-2 flex justify-between items-center">
            <span>{item}</span>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEditStart(index, "do", item)}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(index, "do")}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* DON'TS */}
      <h2 className="text-xl font-semibold mt-4">Don'ts</h2>
      <ul className="list-disc ml-6">
        {donts.map((item, index) => (
          <li key={index} className="mb-2 flex justify-between items-center">
            <span>{item}</span>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEditStart(index, "dont", item)}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(index, "dont")}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* EDIT MODAL / EDIT SECTION */}
      {editIndex !== null && (
        <div className="mt-6 border p-4 rounded-lg bg-white shadow-md">
          <h2 className="text-lg font-semibold mb-2">Edit Guideline</h2>

          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-3"
          />

          <div className="flex gap-3">
            <button
              onClick={handleEditSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>

            <button
              onClick={() => {
                setEditIndex(null);
                setEditType(null);
                setEditValue("");
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guidelines;
