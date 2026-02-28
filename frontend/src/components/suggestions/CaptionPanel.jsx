// src/components/suggestions/CaptionPanel.jsx
import CaptionCard from "./CaptionCard";

export default function CaptionPanel({
  captions = [],
  onInsertCaption,
  onCopyCaption,
  onRegenerate,
}) {
  return (
    <div>
      <div style={styles.actions}>
        <button onClick={onRegenerate} style={styles.btn}>
          Regenerate
        </button>
      </div>

      {captions.length ? (
        <div style={styles.grid}>
          {captions.map((c) => (
            <CaptionCard
              key={c.id}
              template={c}
              onInsert={() => onInsertCaption?.(c.text)}
              onCopy={() => onCopyCaption?.(c.text)}
            />
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          No captions yet. Click <b>Generate</b>.
        </div>
      )}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  empty: {
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 14,
    background: "#fafafa",
    opacity: 0.75,
  },
};