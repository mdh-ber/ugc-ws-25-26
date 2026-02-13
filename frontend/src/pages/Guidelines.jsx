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
  const [type, setType] = useState("do");

  const [editIndex, setEditIndex] = useState(null);
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Content Guidelines</h1>

      {/* ADD NEW GUIDELINE */}
      <div className="border p-4 rounded-lg mb-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add New Guideline</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="do">Do's</option>
            <option value="dont">Don'ts</option>
          </select>

          <input
            type="text"
            value={newGuideline}
            onChange={(e) => setNewGuideline(e.target.value)}
            placeholder="Enter new guideline..."
            className="border rounded px-3 py-2 flex-1"
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
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
                Delete
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

