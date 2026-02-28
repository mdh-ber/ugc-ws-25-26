// src/components/suggestions/HashtagPanel.jsx

export default function HashtagPanel({
  hashtags = [],
  onInsertAll,
  onCopyAll,
  onRegenerate,
  onCopyOne,
}) {
  return (
    <div>
      <div style={styles.actions}>
        <button onClick={onInsertAll} style={styles.btn}>
          Insert
        </button>
        <button onClick={onCopyAll} style={styles.btn}>
          Copy
        </button>
        <button onClick={onRegenerate} style={styles.btn}>
          Regenerate
        </button>
      </div>

      <div style={styles.box}>
        {hashtags.length ? (
          <div style={styles.wrap}>
            {hashtags.map((tag) => (
              <button
                key={tag}
                style={styles.chip}
                onClick={() => onCopyOne?.(tag)}
                title="Click to copy"
              >
                {tag}
              </button>
            ))}
          </div>
        ) : (
          <div style={styles.empty}>
            No hashtags yet. Click <b>Generate</b>.
          </div>
        )}

        <div style={styles.hint}>
          Tip: click any hashtag to copy it.
        </div>
      </div>
    </div>
  );
}

const styles = {
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 },
  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "#f6f6f6",
    cursor: "pointer",
  },
  box: {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 12,
    background: "#fafafa",
  },
  wrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  empty: { padding: 10, opacity: 0.7 },
  hint: { marginTop: 10, fontSize: 12, opacity: 0.65 },
};