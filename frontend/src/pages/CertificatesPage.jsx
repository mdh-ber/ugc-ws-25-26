// pages/CertificatesPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      const res = await axios.get("/api/certificates");
      setCertificates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Create or Update certificate
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await axios.put(`/api/certificates/${editingId}`, formData);
      } else {
        // Create
        await axios.post("/api/certificates", formData);
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
      fetchCertificates();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit certificate
  const handleEdit = (certificate) => {
    setFormData({ name: certificate.name, description: certificate.description });
    setEditingId(certificate.id);
  };

  // Delete certificate
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/certificates/${id}`);
      fetchCertificates();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Certificates</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Certificate Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? "Update" : "Create"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setFormData({ name: "", description: "" }); }}
            className="ml-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Certificates Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.id}>
              <td className="border px-4 py-2">{cert.name}</td>
              <td className="border px-4 py-2">{cert.description}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEdit(cert)}
                  className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {certificates.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                No certificates found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CertificatesPage;
