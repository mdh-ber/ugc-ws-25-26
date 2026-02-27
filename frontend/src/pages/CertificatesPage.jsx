import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/certificates";

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form fields (NO domain)
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issuer, setIssuer] = useState("");
  const [type, setType] = useState("");

  const incomePlaceholder = 0; // replace later with real income

  async function loadCerts() {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setCerts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setCerts([]);
    } finally {
      setLoading(false);
    }
  }

  async function addCert(e) {
    e.preventDefault();

    if (!title || !issueDate || !issuer || !type) {
      alert("Please fill all fields.");
      return;
    }

    // ✅ NO domain in payload
    const payload = { title, issueDate, issuer, type };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Failed to create Certificate");
      return;
    }

    // clear form
    setTitle("");
    setIssueDate("");
    setIssuer("");
    setType("");

    await loadCerts();
  }

  // ✅ Rewards awarded (used to decide whether to show milestones)
  const rewardsAwarded = useMemo(() => {
    const total = certs.length;
    const rewards = [];

    // define “awarded” thresholds
    if (total >= 5) rewards.push({ name: "Bronze Reward", at: 5 });
    if (total >= 10) rewards.push({ name: "Silver Reward", at: 10 });
    if (total >= 25) rewards.push({ name: "Gold Reward", at: 25 });

    return rewards;
  }, [certs]);

  const latestMilestoneLabel = useMemo(() => {
    if (rewardsAwarded.length === 0) return "";
    const latest = rewardsAwarded[rewardsAwarded.length - 1];
    return `${latest.name} (awarded at ${latest.at} certificates)`;
  }, [rewardsAwarded]);

  const nextGoalLabel = useMemo(() => {
    const total = certs.length;
    if (total < 5) return "Next reward at 5 certificates";
    if (total < 10) return "Next reward at 10 certificates";
    if (total < 25) return "Next reward at 25 certificates";
    return "You’ve reached the top reward tier 🎉";
  }, [certs]);

  useEffect(() => {
    loadCerts();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 6 }}>Certificates</h2>
      <p style={{ marginTop: 0, color: "#555" }}>
        Review certificates, earned rewards, and progress during participation.
      </p>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginTop: 12,
          marginBottom: 18,
        }}
      >
        <SummaryCard label="Certificates Earned" value={certs.length} />

        {/* ✅ Milestones ONLY after rewards are awarded */}
        {rewardsAwarded.length > 0 ? (
          <SummaryCard label="Milestone" value={latestMilestoneLabel} />
        ) : (
          <SummaryCard label="Goal" value={nextGoalLabel} />
        )}

        <SummaryCard label="Income (Participation)" value={`€${incomePlaceholder}`} />
      </div>

      {/* Add Certificate */}
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 14,
          padding: 14,
          background: "white",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Add certificate</div>

        <form onSubmit={addCert} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Google Data Analytics"
                style={inputStyle}
              />
            </Field>

            <Field label="Issue date">
              <input
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Issuer">
              <input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g., Coursera, Google, AWS"
                style={inputStyle}
              />
            </Field>

            <Field label="Type of certificate">
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                <option value="">Select type…</option>
                <option value="Course">Course</option>
                <option value="Professional">Professional</option>
                <option value="Workshop">Workshop</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="Award">Award</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="submit" style={primaryBtn}>
              Create Certificate
            </button>
            {loading && <span style={{ color: "#666" }}>Loading…</span>}
          </div>
        </form>
      </div>

      {/* Table */}
      <div
        style={{
          marginTop: 14,
          border: "1px solid #e5e5e5",
          borderRadius: 14,
          overflow: "hidden",
          background: "white",
        }}
      >
        <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 700 }}>
          Your certificates
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Issue date</Th>
                <Th>Issuer</Th>
                <Th>Type</Th>
              </tr>
            </thead>

            <tbody>
              {certs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 12, color: "#666" }}>
                    No certificates yet. Add one above.
                  </td>
                </tr>
              ) : (
                certs.map((c) => (
                  <tr key={c._id} style={{ borderTop: "1px solid #f2f2f2" }}>
                    <Td>{c.title}</Td>
                    <Td>{c.issueDate}</Td>
                    <Td>{c.issuer}</Td>
                    <Td>{c.type}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards list (optional) */}
      {rewardsAwarded.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Rewards awarded</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {rewardsAwarded.map((r) => (
              <span
                key={r.name}
                style={{
                  border: "1px solid #ddd",
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "white",
                  fontSize: 13,
                }}
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 14,
        padding: 12,
        background: "white",
      }}
    >
      <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#444", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: 10,
        fontSize: 13,
        color: "#555",
        background: "#fafafa",
        borderBottom: "1px solid #eee",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td style={{ padding: 10, fontSize: 14, whiteSpace: "nowrap" }}>{children}</td>;
}

const inputStyle = {
  width: "100%",
  padding: "10px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  background: "white",
};

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryBtn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
};