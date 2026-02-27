import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/certificates";
const PRESET_TYPES = ["Course", "Professional", "Workshop", "Bootcamp", "Award"];

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(""); // create | edit:<id> | del:<id>
  const [notice, setNotice] = useState({ type: "", msg: "" });

  // Create form
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issuer, setIssuer] = useState("Marketing Manager");
  const [issuedTo, setIssuedTo] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");

  // Search + filter
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: "",
    title: "",
    issueDate: "",
    issuer: "",
    issuedTo: "",
    type: "",
    customType: "",
  });

  // Details drawer
  const [selected, setSelected] = useState(null);

  function toast(type, msg) {
    setNotice({ type, msg });
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => setNotice({ type: "", msg: "" }), 2800);
  }

  async function loadCerts() {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setCerts(items);

      if (selected?._id) {
        const refreshed = items.find((x) => x._id === selected._id);
        setSelected(refreshed || null);
      }
    } catch (e) {
      console.error(e);
      toast("error", "Failed to load certificates.");
      setCerts([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  function validate({ title, issueDate, issuer, issuedTo, type, customType }) {
    const t = (title || "").trim();
    const d = (issueDate || "").trim();
    const i = (issuer || "").trim();
    const it = (issuedTo || "").trim();
    const ty = (type || "").trim();
    const cty = (customType || "").trim();

    const finalType = ty === "Other" ? cty : ty;

    if (!t) return { ok: false, message: "Title is required." };
    if (!d) return { ok: false, message: "Issue date is required." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d))
      return { ok: false, message: "Issue date must be YYYY-MM-DD." };
    if (!i) return { ok: false, message: "Issuer is required." };
    if (!it) return { ok: false, message: "Issued to is required." };
    if (!ty) return { ok: false, message: "Type is required." };
    if (ty === "Other" && !cty) return { ok: false, message: "Enter custom type." };

    return { ok: true, finalType };
  }

  async function createCert(e) {
    e.preventDefault();

    const v = validate({ title, issueDate, issuer, issuedTo, type, customType });
    if (!v.ok) return toast("error", v.message);

    const payload = {
      title: title.trim(),
      issueDate: issueDate.trim(),
      issuer: issuer.trim(),
      issuedTo: issuedTo.trim(),
      type: v.finalType,
    };

    setBusyId("create");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        function checkRewards(total) {
  const awardedKey = "awarded_rewards_v1";
  const awarded = new Set(JSON.parse(localStorage.getItem(awardedKey) || "[]"));

  const thresholds = [
    { at: 5, name: "Bronze Reward" },
    { at: 10, name: "Silver Reward" },
    { at: 25, name: "Gold Reward" },
  ];

  for (const t of thresholds) {
    if (total >= t.at && !awarded.has(String(t.at))) {
      awarded.add(String(t.at));
      localStorage.setItem(awardedKey, JSON.stringify([...awarded]));

      // 🎁 Reward notification
      if (window.pushNotif) {
        window.pushNotif({
          category: "reward",
          title: `Reward unlocked: ${t.name}`,
          message: `Congratulations! You reached ${t.at} certificates.`,
          link: "/rewards",
        });

        // 🎯 Milestone notification
        window.pushNotif({
          category: "milestone",
          title: "Milestone reached",
          message: `You achieved ${t.at} certificate milestone.`,
          link: "/milestones",
        });
      }
    }
  }
}
        return toast("error", err.message || "Failed to create certificate.");
      }

      setTitle("");
      setIssueDate("");
      setIssuer("Marketing Manager");
      setIssuedTo("");
      setType("");
      setCustomType("");
toast("success", "Certificate created ✅");

// ✅ Push certificate notification
if (window.pushNotif) {
  window.pushNotif({
    category: "certificate",
    title: "New certificate added",
    message: `You added "${payload.title}" for ${payload.issuedTo}.`,
    link: "/certificates",
  });
}

await loadCerts();

// ✅ After reload, check rewards
checkRewards(certs.length + 1);
    } catch (e) {
      console.error(e);
      toast("error", "Server error while creating certificate.");
    } finally {
      setBusyId("");
    }
  }

  function openEditModal(cert) {
    const isPreset = PRESET_TYPES.includes(cert.type);
    setEditForm({
      _id: cert._id,
      title: cert.title || "",
      issueDate: cert.issueDate || "",
      issuer: cert.issuer || "Marketing Manager",
      issuedTo: cert.issuedTo || "",
      type: isPreset ? cert.type : "Other",
      customType: isPreset ? "" : cert.type || "",
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    const v = validate(editForm);
    if (!v.ok) return toast("error", v.message);

    const id = editForm._id;
    if (!id) return toast("error", "Missing certificate id.");

    const payload = {
      title: editForm.title.trim(),
      issueDate: editForm.issueDate.trim(),
      issuer: editForm.issuer.trim(),
      issuedTo: editForm.issuedTo.trim(),
      type: v.finalType,
    };

    setBusyId(`edit:${id}`);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return toast("error", err.message || "Failed to update certificate.");
      }

      setEditOpen(false);
      toast("success", "Updated ✅");
      await loadCerts();
    } catch (e) {
      console.error(e);
      toast("error", "Server error while updating.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteCert(id) {
    const ok = window.confirm("Delete this certificate?");
    if (!ok) return;

    setBusyId(`del:${id}`);
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return toast("error", err.message || "Failed to delete certificate.");
      }

      if (selected?._id === id) setSelected(null);

      toast("success", "Deleted ✅");
      await loadCerts();
    } catch (e) {
      console.error(e);
      toast("error", "Server error while deleting.");
    } finally {
      setBusyId("");
    }
  }

  // Type filter options from DB
  const typeOptions = useMemo(() => {
    const set = new Set();
    for (const c of certs) if (c?.type) set.add(c.type);
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [certs]);

  // Filtered certs
  const filteredCerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certs.filter((c) => {
      if (typeFilter !== "All" && c.type !== typeFilter) return false;
      if (!q) return true;

      const hay = [c.title, c.issuer, c.issuedTo, c.type, c.issueDate]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [certs, search, typeFilter]);

  // ===== Motivation & Rewards =====
  // Rewards are "awarded" when certificate count reaches thresholds.
  const rewardsAwarded = useMemo(() => {
    const total = certs.length;
    const rewards = [];
    if (total >= 5) rewards.push({ key: "bronze", name: "Bronze Reward", at: 5 });
    if (total >= 10) rewards.push({ key: "silver", name: "Silver Reward", at: 10 });
    if (total >= 25) rewards.push({ key: "gold", name: "Gold Reward", at: 25 });
    return rewards;
  }, [certs]);

  const milestoneVisible = rewardsAwarded.length > 0;

  const latestMilestone = useMemo(() => {
    if (!milestoneVisible) return null;
    return rewardsAwarded[rewardsAwarded.length - 1];
  }, [rewardsAwarded, milestoneVisible]);

  const nextGoal = useMemo(() => {
    const total = certs.length;
    if (total < 5) return { label: "Next reward", value: "Earn 5 certificates" };
    if (total < 10) return { label: "Next reward", value: "Earn 10 certificates" };
    if (total < 25) return { label: "Next reward", value: "Earn 25 certificates" };
    return { label: "Top tier", value: "All rewards unlocked 🎉" };
  }, [certs]);

  const incomeMade = 0; // TODO: replace with real income later

  // ===== Option B cards =====
  const totalCertificates = certs.length;

  useEffect(() => {
    loadCerts();
  }, []);

  const createDisabled = loading || busyId === "create";

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.topRow}>
        <div>
          <div style={s.title}>Certificates</div>
          <div style={s.subtitle}>Create, search, edit, and manage certificates.</div>
        </div>

        {notice.msg ? (
          <div style={{ ...s.toast, ...(notice.type === "success" ? s.toastOk : s.toastErr) }}>
            {notice.msg}
          </div>
        ) : null}
      </div>

      {/* Summary cards */}
      <div style={s.cards}>
        <Card label="Total Certificates" value={totalCertificates} />

        {/* ✅ Milestones only after rewards are awarded */}
        {milestoneVisible ? (
          <Card
            label="Milestone (awarded)"
            value={`${latestMilestone.name} • at ${latestMilestone.at}`}
          />
        ) : (
          <Card label={nextGoal.label} value={nextGoal.value} />
        )}

        <Card label="Income (Participation)" value={`€${incomeMade}`} />
      </div>

      {/* Rewards awarded chips (optional) */}
      {milestoneVisible && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900, marginBottom: 8 }}>
            Rewards awarded
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {rewardsAwarded.map((r) => (
              <span key={r.key} style={s.badge}>
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={s.grid}>
        {/* Left: Create */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>Add certificate</div>
            <div style={s.muted}>{createDisabled ? "Working..." : ""}</div>
          </div>

          <form onSubmit={createCert} style={s.form}>
            <Field label="Title">
              <input
                style={s.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Google Data Analytics"
              />
            </Field>

            <Field label="Issue date">
              <input
                style={s.input}
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </Field>

            <Field label="Issuer">
              <input
                style={s.input}
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g., Coursera, Google"
              />
            </Field>

            <Field label="Issued to">
              <input
                style={s.input}
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </Field>

            <Field label="Type">
              <select
                style={s.input}
                value={type}
                onChange={(e) => {
                  const v = e.target.value;
                  setType(v);
                  if (v !== "Other") setCustomType("");
                }}
              >
                <option value="">Select type…</option>
                {PRESET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {type === "Other" && (
                <input
                  style={{ ...s.input, marginTop: 10 }}
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Enter custom type (e.g., Internship)"
                />
              )}
            </Field>

            <div style={s.actions}>
              <button
                disabled={createDisabled}
                style={{ ...s.btnPrimary, ...(createDisabled ? s.btnDisabled : null) }}
              >
                {busyId === "create" ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                disabled={createDisabled}
                style={{ ...s.btnGhost, ...(createDisabled ? s.btnDisabled : null) }}
                onClick={() => {
                  setTitle("");
                  setIssueDate("");
                  setIssuer("");
                  setIssuedTo("");
                  setType("");
                  setCustomType("");
                  toast("success", "Form cleared.");
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Middle: Card list */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>Your certificates</div>
            <button style={s.btnGhostSmall} onClick={loadCerts} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Search + filter */}
          <div style={s.tools}>
            <input
              style={s.input}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, issuer, issued to, type..."
            />
            <select style={s.input} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All types" : t}
                </option>
              ))}
            </select>
          </div>

          <div style={s.smallMeta}>
            Showing <b>{filteredCerts.length}</b> of <b>{certs.length}</b>
          </div>

          {/* Cards grid */}
          {filteredCerts.length === 0 ? (
            <div style={s.emptyBox}>No results. Try clearing search/filter.</div>
          ) : (
            <div style={s.cardGrid}>
              {filteredCerts.map((c) => (
                <div
                  key={c._id}
                  style={{ ...s.certCard, ...(selected?._id === c._id ? s.certCardSelected : null) }}
                  onClick={() => setSelected(c)}
                  title="Click to open details"
                >
                  <div style={s.certTop}>
                    <div style={s.certTitle}>{c.title}</div>
                    <span style={s.badge}>{c.type}</span>
                  </div>

                  <div style={s.certMeta}>
                    <div style={s.metaRow}>
                      <span style={s.metaKey}>Date</span>
                      <span style={s.metaVal}>{c.issueDate}</span>
                    </div>
                    <div style={s.metaRow}>
                      <span style={s.metaKey}>Issuer</span>
                      <span style={s.metaVal}>{c.issuer}</span>
                    </div>
                    <div style={s.metaRow}>
                      <span style={s.metaKey}>Issued to</span>
                      <span style={s.metaVal}>{c.issuedTo}</span>
                    </div>
                  </div>

                  <div style={s.certActions} onClick={(e) => e.stopPropagation()}>
                    <button style={s.btnTiny} onClick={() => openEditModal(c)}>
                      Edit
                    </button>
                    <button
                      style={{ ...s.btnTiny, ...s.btnDanger }}
                      onClick={() => deleteCert(c._id)}
                      disabled={busyId === `del:${c._id}`}
                    >
                      {busyId === `del:${c._id}` ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div style={s.drawer}>
          <div style={s.drawerHeader}>
            <div style={s.drawerTitle}>Details</div>
            {selected ? (
              <button style={s.btnGhostSmall} onClick={() => setSelected(null)}>
                Close
              </button>
            ) : null}
          </div>

          {!selected ? (
            <div style={s.drawerEmpty}>
              <div style={{ fontWeight: 900, color: "#111827" }}>Select a certificate</div>
              <div style={{ color: "#6b7280", marginTop: 6 }}>
                Click any certificate card to view details here.
              </div>
            </div>
          ) : (
            <div style={s.drawerBody}>
              <KV k="Title" v={selected.title} />
              <KV k="Issue date" v={selected.issueDate} />
              <KV k="Issuer" v={selected.issuer} />
              <KV k="Issued to" v={selected.issuedTo} />
              <KV
                k="Type"
                v={
                  <span style={s.badge} title={selected.type}>
                    {selected.type}
                  </span>
                }
              />

              <div style={s.divider} />

              <div style={s.drawerActions}>
                <button style={s.btnPrimary} onClick={() => openEditModal(selected)}>
                  Edit
                </button>
                <button
                  style={{ ...s.btnGhost, ...s.btnDangerGhost }}
                  onClick={() => deleteCert(selected._id)}
                  disabled={busyId === `del:${selected._id}`}
                >
                  {busyId === `del:${selected._id}` ? "Deleting..." : "Delete"}
                </button>
              </div>

              <div style={s.meta}>
                <div>
                  <span style={s.metaLabel}>Created:</span>{" "}
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                </div>
                <div>
                  <span style={s.metaLabel}>Updated:</span>{" "}
                  {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : "-"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div style={s.modalOverlay} onMouseDown={() => setEditOpen(false)}>
          <div style={s.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>Edit certificate</div>
              <button style={s.modalClose} onClick={() => setEditOpen(false)}>
                ✕
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={s.modalGrid}>
                <Field label="Title">
                  <input
                    style={s.input}
                    value={editForm.title}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </Field>

                <Field label="Issue date">
                  <input
                    style={s.input}
                    type="date"
                    value={editForm.issueDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, issueDate: e.target.value }))}
                  />
                </Field>

                <Field label="Issuer">
                  <input
                    style={s.input}
                    value={editForm.issuer}
                    onChange={(e) => setEditForm((p) => ({ ...p, issuer: e.target.value }))}
                  />
                </Field>

                <Field label="Issued to">
                  <input
                    style={s.input}
                    value={editForm.issuedTo}
                    onChange={(e) => setEditForm((p) => ({ ...p, issuedTo: e.target.value }))}
                  />
                </Field>

                <Field label="Type">
                  <select
                    style={s.input}
                    value={editForm.type}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditForm((p) => ({
                        ...p,
                        type: v,
                        customType: v === "Other" ? p.customType : "",
                      }));
                    }}
                  >
                    <option value="">Select type…</option>
                    {PRESET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>

                  {editForm.type === "Other" && (
                    <input
                      style={{ ...s.input, marginTop: 10 }}
                      value={editForm.customType}
                      onChange={(e) => setEditForm((p) => ({ ...p, customType: e.target.value }))}
                      placeholder="Enter custom type"
                    />
                  )}
                </Field>
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnGhost} onClick={() => setEditOpen(false)}>
                Cancel
              </button>
              <button
                style={s.btnPrimary}
                onClick={saveEdit}
                disabled={busyId === `edit:${editForm._id}`}
              >
                {busyId === `edit:${editForm._id}` ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Card({ label, value }) {
  return (
    <div style={s.card}>
      <div style={s.cardLabel}>{label}</div>
      <div style={s.cardValue}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={s.field}>
      <div style={s.fieldLabel}>{label}</div>
      {children}
    </label>
  );
}

function KV({ k, v }) {
  return (
    <div style={s.kv}>
      <div style={s.k}>{k}</div>
      <div style={s.v}>{v}</div>
    </div>
  );
}

/* ---------- styles ---------- */

const s = {
  page: { padding: 18, maxWidth: 1400, margin: "0 auto" },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: 900, color: "#111827" },
  subtitle: { marginTop: 6, color: "#6b7280", fontSize: 13 },

  toast: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 13,
    maxWidth: 360,
    lineHeight: 1.3,
  },
  toastOk: { background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" },
  toastErr: { background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  },
  cardLabel: { fontSize: 12, color: "#6b7280", fontWeight: 700 },
  cardValue: { marginTop: 8, fontSize: 16, fontWeight: 900, color: "#111827" },

  grid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr 320px",
    gap: 12,
    alignItems: "start",
  },

  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: { fontSize: 14, fontWeight: 900, color: "#111827" },
  muted: { color: "#6b7280", fontSize: 12 },

  form: { display: "grid", gap: 10 },
  field: { display: "grid", gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 800, color: "#374151" },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 14,
    background: "#fff",
  },

  actions: { display: "flex", gap: 10, marginTop: 6 },

  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnGhostSmall: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 12,
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

  tools: {
    display: "grid",
    gridTemplateColumns: "1fr 200px",
    gap: 10,
    marginBottom: 8,
  },
  smallMeta: { color: "#6b7280", fontSize: 12, marginBottom: 8 },

  emptyBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px dashed #e5e7eb",
    background: "#fafafa",
    color: "#6b7280",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: 12,
    fontWeight: 900,
    color: "#111827",
    whiteSpace: "nowrap",
  },

  // Certificates grid cards
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  certCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 12,
    background: "#fff",
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
    cursor: "pointer",
    transition: "transform 0.06s ease",
  },
  certCardSelected: {
    borderColor: "#111827",
    boxShadow: "0 6px 20px rgba(17,24,39,0.08)",
  },
  certTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  certTitle: {
    fontWeight: 950,
    color: "#111827",
    fontSize: 14,
    lineHeight: 1.2,
  },
  certMeta: { marginTop: 10, display: "grid", gap: 6 },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 12,
  },
  metaKey: { color: "#6b7280", fontWeight: 900 },
  metaVal: { color: "#111827", fontWeight: 800 },

  certActions: {
    marginTop: 12,
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  btnTiny: {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },
  btnDanger: {
    borderColor: "#fecaca",
    background: "#fff",
    color: "#991b1b",
  },
  btnDangerGhost: {
    borderColor: "#fecaca",
    color: "#991b1b",
  },

  // Drawer
  drawer: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
    position: "sticky",
    top: 12,
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  drawerTitle: { fontSize: 14, fontWeight: 900, color: "#111827" },
  drawerEmpty: {
    padding: 10,
    borderRadius: 14,
    border: "1px dashed #e5e7eb",
    background: "#fafafa",
  },
  drawerBody: { display: "grid", gap: 10 },
  kv: { display: "grid", gridTemplateColumns: "100px 1fr", gap: 10, alignItems: "start" },
  k: { fontSize: 12, fontWeight: 900, color: "#6b7280" },
  v: { fontSize: 13, color: "#111827" },
  divider: { height: 1, background: "#f3f4f6", margin: "6px 0" },
  drawerActions: { display: "flex", gap: 10, marginTop: 2 },
  meta: { color: "#6b7280", fontSize: 12, marginTop: 6, display: "grid", gap: 6 },
  metaLabel: { fontWeight: 900, color: "#374151" },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.55)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    width: "min(760px, 96vw)",
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottom: "1px solid #f3f4f6",
  },
  modalTitle: { fontWeight: 900, color: "#111827" },
  modalClose: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 900,
  },
  modalBody: { padding: 14 },
  modalGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: 14,
    borderTop: "1px solid #f3f4f6",
  },
};