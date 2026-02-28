// src/components/suggestions/CaptionCard.jsx

export default function CaptionCard({ template, onInsert, onCopy }) {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          <h4 style={styles.title}>{template?.title || "Template"}</h4>
          <p style={styles.sub}>Insert replaces the composer text.</p>
        </div>
        <span style={styles.badge}>template</span>
      </div>

      <pre style={styles.pre}>{template?.text || ""}</pre>

      <div style={styles.actions}>
        <button onClick={onInsert} style={styles.primaryBtn}>
          Insert
        </button>
        <button onClick={onCopy} style={styles.btn}>
          Copy
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 12,
    background: "#fff",
  },
  top: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  title: { margin: 0, fontSize: 15 },
  sub: { margin: "4px 0 0", fontSize: 12, opacity: 0.7 },
  badge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.18)",
    whiteSpace: "nowrap",
  },
  pre: {
    whiteSpace: "pre-wrap",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 10,
    background: "#fafafa",
    margin: 0,
    fontSize: 13,
    lineHeight: 1.45,
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "#f6f6f6",
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
};