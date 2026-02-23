import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import CertificateCard from "../components/certificates/CertificateCard";
import CertificateModal from "../components/certificates/CertificateModal";

const API_BASE = "http://localhost:5000/api";

export default function CertificatesPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isManager = params.get("mode") === "manager";

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Create modal (manager only)
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    userId: "000000000000000000000001",
    title: "",
    issuer: "MDH University",
    issueDate: "",
    domain: "Cybersecurity",
    certType: "Participation",
    description: "",
    incomeMade: 0,
    certificateUrl: "",
  });

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setErrMsg("");

      const url = isManager ? `${API_BASE}/certificates?page=1&limit=50` : `${API_BASE}/certificates/me?page=1&limit=50`;

      const res = await axios.get(url, { headers });
      const list = Array.isArray(res?.data?.items) ? res.data.items : [];

      // remove null/undefined just in case
      setItems(list.filter(Boolean));
    } catch (e) {
      console.error(e);
      setErrMsg(e?.response?.data?.message || "Failed to load certificates");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const createCertificate = async (e) => {
    e.preventDefault();
    try {
      setErrMsg("");

      // backend expects issueDate, title, userId minimally
      await axios.post(`${API_BASE}/certificates`, form, { headers });

      setShowCreate(false);
      setForm((p) => ({
        ...p,
        title: "",
        issueDate: "",
        description: "",
        incomeMade: 0,
        certificateUrl: "",
      }));
      fetchCertificates();
    } catch (e2) {
      console.error(e2);
      setErrMsg(e2?.response?.data?.message || "Server error while creating certificate");
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isManager]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Certificates</h2>
          <p className="text-sm text-gray-600 mt-1">
            View your certificates by domain/type and earnings during participation.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Certificate
          </button>
        )}
      </div>

      {errMsg && (
        <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {errMsg}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-gray-600">Loading…</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <>
              <div className="bg-white border rounded-xl p-6 text-gray-500">+ Certificate Placeholder</div>
              <div className="bg-white border rounded-xl p-6 text-gray-500">+ Certificate Placeholder</div>
              <div className="bg-white border rounded-xl p-6 text-gray-500">+ Certificate Placeholder</div>
            </>
          ) : (
            items.map((c) => (
              <CertificateCard key={c._id} certificate={c} onView={setSelected} />
            ))
          )}
        </div>
      )}

      <CertificateModal certificate={selected} onClose={() => setSelected(null)} />

      {/* Create Modal (Manager) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[700px] max-w-[92vw]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold">Create Certificate</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={createCertificate} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold">User ID (Mongo ObjectId)</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold">Title</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Issuer</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Issue Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 mt-1"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Domain</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Certificate Type</label>
                <select
                  className="w-full border rounded p-2 mt-1"
                  value={form.certType}
                  onChange={(e) => setForm({ ...form, certType: e.target.value })}
                >
                  <option>Participation</option>
                  <option>Achievement</option>
                  <option>Completion</option>
                  <option>Excellence</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold">Description (optional)</label>
                <textarea
                  className="w-full border rounded p-2 mt-1"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Income Made (€)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2 mt-1"
                  value={form.incomeMade}
                  onChange={(e) => setForm({ ...form, incomeMade: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Certificate URL (optional)</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.certificateUrl}
                  onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}