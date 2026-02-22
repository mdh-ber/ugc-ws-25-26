// pages/CertificatesPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const emptyForm = {
  title: "",
  issueDate: "",
  issuer: "",
  domain: "",
  type: "",
};

// get id from either id or _id
const getId = (obj) => obj?.id ?? obj?._id;

// extract certificate object from different response shapes
const extractCert = (data) => {
  if (!data) return null;

  // common wrappers
  if (data.certificate) return data.certificate;
  if (data.data) return data.data;
  if (data.result) return data.result;

  // direct object
  if (typeof data === "object") return data;

  return null;
};

function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/certificates");

      // if backend returns {data:[...]} instead of [...]
      const list = Array.isArray(res.data) ? res.data : res.data?.data;
      setCertificates(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch certificates error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingId) {
        const res = await axios.put(`/api/certificates/${editingId}`, formData);

        const updatedFromServer = extractCert(res.data);
        const updated = updatedFromServer
          ? updatedFromServer
          : { ...formData, id: editingId };

        setCertificates((prev) =>
          prev.map((c) => (getId(c) === editingId ? updated : c))
        );
      } else {
        const res = await axios.post("/api/certificates", formData);

        const createdFromServer = extractCert(res.data);

        // If backend doesn't return created object, refetch
        if (!createdFromServer) {
          await fetchCertificates();
        } else {
          const created = {
            ...createdFromServer,
            id: getId(createdFromServer) ?? crypto?.randomUUID?.() ?? Date.now(),
          };

          setCertificates((prev) => [...prev, created]);
        }
      }

      setFormData(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleEdit = (certificate) => {
    const id = getId(certificate);
    setEditingId(id);

    setFormData({
      title: certificate.title ?? "",
      issueDate: certificate.issueDate ?? "",
      issuer: certificate.issuer ?? "",
      domain: certificate.domain ?? "",
      type: certificate.type ?? "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/certificates/${id}`);
      setCertificates((prev) => prev.filter((c) => getId(c) !== id));
      if (editingId === id) handleCancel();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Certificates</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="text"
            name="issuer"
            placeholder="Issuer (e.g., Google, Coursera)"
            value={formData.issuer}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="text"
            name="domain"
            placeholder="Domain (e.g., Web Dev, AI, Cloud)"
            value={formData.domain}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="text"
            name="type"
            placeholder="Type (e.g., Professional, Course, Internship)"
            value={formData.type}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingId ? "Update" : "Create"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={fetchCertificates}
            className="ml-auto px-4 py-2 border rounded hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Title</th>
              <th className="border px-4 py-2 text-left">Issue Date</th>
              <th className="border px-4 py-2 text-left">Issuer</th>
              <th className="border px-4 py-2 text-left">Domain</th>
              <th className="border px-4 py-2 text-left">Type</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              certificates.map((cert) => {
                const id = getId(cert);
                return (
                  <tr key={id}>
                    <td className="border px-4 py-2">{cert.title}</td>
                    <td className="border px-4 py-2">{cert.issueDate}</td>
                    <td className="border px-4 py-2">{cert.issuer}</td>
                    <td className="border px-4 py-2">{cert.domain}</td>
                    <td className="border px-4 py-2">{cert.type}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(cert)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

            {!loading && certificates.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No certificates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CertificatesPage;