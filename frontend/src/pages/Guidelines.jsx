// src/components/Guidelines.js
import { useState, useEffect } from "react";
import api from "../services/api";

const Guidelines = () => {
  const [dos, setDos] = useState([]);
  const [donts, setDonts] = useState([]);

  const [newGuideline, setNewGuideline] = useState("");
  const [type, setType] = useState("dos");

  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState(null);
  const [editValue, setEditValue] = useState("");

  // FETCH guidelines from backend
  const fetchGuidelines = async () => {
    try {
      const dosRes = await api.get("/guidelines/category/dos");
      const dontsRes = await api.get("/guidelines/category/donts");

      setDos(dosRes.data.data);
      setDonts(dontsRes.data.data);
    } catch (error) {
      console.error("Failed to connect to backend:", error);

      // fallback
      setDos([
        { _id: "1", title: "Follow university branding rules" },
        { _id: "2", title: "Use clear audio and video" },
        { _id: "3", title: "Be respectful and professional" },
      ]);

      setDonts([
        { _id: "4", title: "Do not post offensive content" },
        { _id: "5", title: "Do not share private information" },
        { _id: "6", title: "Do not violate copyright rules" },
      ]);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  // ADD guideline
  const handleAdd = async () => {
    if (!newGuideline.trim()) return;

    try {
      const payload = {
        title: newGuideline,
        category: type, // dos / donts
      };

      await api.post("/guidelines", payload);

      setNewGuideline("");
      fetchGuidelines();
    } catch (error) {
      console.error("Error adding guideline:", error);
    }
  };

  // DELETE guideline
  const handleDelete = async (id) => {
    try {
      await api.delete(`/guidelines/${id}`);
      fetchGuidelines();
    } catch (error) {
      console.error("Error deleting guideline:", error);
    }
  };

  // START EDIT
  const handleEditStart = (id, listType, value) => {
    setEditId(id);
    setEditType(listType);
    setEditValue(value);
  };

  // SAVE EDIT
  const handleEditSave = async () => {
    if (!editValue.trim()) return;

    try {
      await api.put(`/guidelines/${editId}`, {
        title: editValue,
        category: editType,
      });

      setEditId(null);
      setEditType(null);
      setEditValue("");

      fetchGuidelines();
    } catch (error) {
      console.error("Error updating guideline:", error);
    }
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
            <option value="dos">Do's</option>
            <option value="donts">Don'ts</option>
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
        {dos.map((item) => (
          <li key={item._id} className="mb-2 flex justify-between items-center">
            <span>{item.title}</span>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEditStart(item._id, "dos", item.title)}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item._id)}
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
        {donts.map((item) => (
          <li key={item._id} className="mb-2 flex justify-between items-center">
            <span>{item.title}</span>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEditStart(item._id, "donts", item.title)}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* EDIT SECTION */}
      {editId !== null && (
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
                setEditId(null);
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

