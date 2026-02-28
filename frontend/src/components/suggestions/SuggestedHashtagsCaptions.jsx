// src/components/suggestions/SuggestedHashtagsCaptions.jsx
import { useEffect, useMemo, useState } from "react";
import useClipboard from "../../hooks/useClipboard";
import {
  generateSuggestions,
  getCampaignOptions,
} from "../../services/suggestionsService";

import HashtagPanel from "./HashtagPanel";
import CaptionPanel from "./CaptionPanel";

export default function SuggestedHashtagsCaptions() {
  const campaignOptions = useMemo(() => getCampaignOptions(), []);
  const [campaignId, setCampaignId] = useState(
    campaignOptions?.[0]?.id || "spring"
  );
  const [keywords, setKeywords] = useState("");
  const [seed, setSeed] = useState(0);

  const [activeTab, setActiveTab] = useState("hashtags"); // "hashtags" | "captions"
  const [postText, setPostText] = useState(
    "Draft post text...\n\n(Use Insert buttons to add captions/hashtags.)"
  );

  const [hashtags, setHashtags] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [campaignMeta, setCampaignMeta] = useState(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState(null);

  const { copy, copied } = useClipboard();

  // ✅ Auto-generate whenever inputs change (campaign / keywords / seed)
  useEffect(() => {
    const result = generateSuggestions({ campaignId, keywords, seed });
    setHashtags(result.hashtags);
    setCaptions(result.captions);
    setCampaignMeta(result.campaign);
    setLastGeneratedAt(new Date());
  }, [campaignId, keywords, seed]);

  const handleGenerate = () => {
    // optional manual generate (still useful if you want it)
    const result = generateSuggestions({ campaignId, keywords, seed });
    setHashtags(result.hashtags);
    setCaptions(result.captions);
    setCampaignMeta(result.campaign);
    setLastGeneratedAt(new Date());
  };

  const handleRegenerate = () => {
    // ✅ safer: compute next seed first
    setSeed((prev) => prev + 1);
  };

  // Insert logic
  const insertHashtagsIntoPost = () => {
    if (!hashtags.length) return;
    const tagsText = hashtags.join(" ");
    setPostText((prev) => {
      const base = prev || "";
      const spacer = base.trim().length ? "\n\n" : "";
      return base + spacer + tagsText;
    });
    setActiveTab("hashtags");
  };

  const insertCaptionIntoPost = (captionText) => {
    if (!captionText) return;
    setPostText(captionText);
    setActiveTab("captions");
  };

  const copyHashtags = () => {
    if (!hashtags.length) return;
    copy(hashtags.join(" "));
  };

  const clearPost = () => setPostText("");

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Suggested Hashtags & Captions</h2>
        <p style={styles.sub}>
          Based on selected campaign + optional keywords. Generate, regenerate,
          and insert into your post with one click.
        </p>
      </div>

      <div style={styles.grid}>
        {/* LEFT: Inputs + Composer */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Inputs</h3>

          <label style={styles.label}>Campaign</label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            style={styles.select}
          >
            {campaignOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label style={styles.label}>Caption keywords (optional)</label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. sustainable, budget, beginner"
            style={styles.input}
          />

          <div style={styles.row}>
            <button onClick={handleGenerate} style={styles.primaryBtn}>
              Generate
            </button>
            <button onClick={handleRegenerate} style={styles.btn}>
              Regenerate
            </button>
          </div>

          <div style={styles.meta}>
            {campaignMeta ? (
              <>
                <span style={styles.badge}>{campaignMeta.name}</span>
                <span style={styles.badgeOutline}>
                  tone: {campaignMeta.tone}
                </span>
              </>
            ) : null}
          </div>

          <hr style={styles.hr} />

          <div style={styles.composerHeader}>
            <h3 style={styles.cardTitle}>Post composer</h3>
            <div style={styles.row}>
              <button
                onClick={() => copy(postText)}
                style={styles.smallBtn}
                title="Copy composer text"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={clearPost}
                style={styles.smallBtn}
                title="Clear composer"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={10}
            style={styles.textarea}
          />

          <div style={styles.row}>
            <button onClick={insertHashtagsIntoPost} style={styles.btn}>
              Insert hashtags
            </button>
            <button onClick={copyHashtags} style={styles.btn}>
              Copy hashtags
            </button>
          </div>

          <div style={styles.last}>
            {lastGeneratedAt ? (
              <span>Last generated: {lastGeneratedAt.toLocaleString()}</span>
            ) : (
              <span>Generate suggestions to start.</span>
            )}
          </div>
        </div>

        {/* RIGHT: Suggestions */}
        <div style={styles.card}>
          <div style={styles.tabs}>
            <button
              onClick={() => setActiveTab("hashtags")}
              style={{
                ...styles.tab,
                ...(activeTab === "hashtags" ? styles.tabActive : {}),
              }}
            >
              Hashtags
            </button>
            <button
              onClick={() => setActiveTab("captions")}
              style={{
                ...styles.tab,
                ...(activeTab === "captions" ? styles.tabActive : {}),
              }}
            >
              Caption templates
            </button>
          </div>

          {activeTab === "hashtags" ? (
            <HashtagPanel
              hashtags={hashtags}
              onInsertAll={insertHashtagsIntoPost}
              onCopyAll={copyHashtags}
              onRegenerate={handleRegenerate}
              onCopyOne={(tag) => copy(tag)}
            />
          ) : (
            <CaptionPanel
              captions={captions}
              onInsertCaption={insertCaptionIntoPost}
              onCopyCaption={(text) => copy(text)}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- minimal styling ----------------- */
const styles = {
  page: { padding: 16, maxWidth: 1200, margin: "0 auto" },
  header: { marginBottom: 12 },
  sub: { margin: "6px 0 0", opacity: 0.75 },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  },
  card: {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
  },
  cardTitle: { margin: "0 0 10px" },
  label: { display: "block", marginTop: 10, marginBottom: 6, fontSize: 13 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    resize: "vertical",
  },
  row: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
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
  smallBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "#f6f6f6",
    cursor: "pointer",
    fontSize: 12,
  },
  hr: { margin: "14px 0", border: "none", borderTop: "1px solid #eee" },
  composerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "#f6f6f6",
    cursor: "pointer",
  },
  tabActive: {
    background: "#111",
    color: "#fff",
    borderColor: "#111",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#111",
    color: "#fff",
    fontSize: 12,
  },
  badgeOutline: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.18)",
    fontSize: 12,
  },
  meta: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" },
  last: { marginTop: 10, fontSize: 12, opacity: 0.7 },
};