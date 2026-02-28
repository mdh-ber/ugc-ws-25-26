// src/services/suggestionsService.js
// Frontend-only suggestion generator (no API needed)

const CAMPAIGN_MAP = {
  spring: {
    name: "Spring Drop",
    tone: "fresh",
    themes: ["spring", "drop", "style", "new", "limited"],
  },
  fitness: {
    name: "Fitness Challenge",
    tone: "motivational",
    themes: ["fitness", "challenge", "progress", "routine", "community"],
  },
  launch: {
    name: "Product Launch",
    tone: "excited",
    themes: ["launch", "new", "feature", "demo", "preorder"],
  },
  travel: {
    name: "Travel Series",
    tone: "curious",
    themes: ["travel", "guide", "culture", "food", "hidden"],
  },
};

function uniq(arr) {
  return Array.from(new Set(arr));
}

function hashSeed(str) {
  // deterministic integer from string
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) + 1;
}

function seededPick(list, seed, n) {
  // deterministic picks using a simple LCG
  const out = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const idx = Math.floor((x / 233280) * list.length);
    out.push(list[idx]);
  }
  return out;
}

function slugifyHashtag(s) {
  // "#Hello World!" -> "#HelloWorld"
  return (
    "#" +
    String(s)
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "")
  );
}

function getCampaign(campaignId) {
  return (
    CAMPAIGN_MAP[campaignId] || {
      name: "Campaign",
      tone: "neutral",
      themes: ["creator", "content", "trending"],
    }
  );
}

/**
 * Generates suggestions based on campaign + optional keywords.
 * seed is used to regenerate different outputs deterministically.
 */
export function generateSuggestions({ campaignId, keywords = "", seed = 0 }) {
  const campaign = getCampaign(campaignId);

  const kw = keywords
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const baseTags = [
    "creator",
    "content",
    "reels",
    "tiktok",
    "instagram",
    "viral",
    "trending",
    "fyp",
    "explorepage",
    "smallbusiness",
    "brand",
    "ugc",
    "community",
    "tips",
    "howto",
    "behindthescenes",
    "new",
    "limited",
    "drop",
    "launch",
    "routine",
    "motivation",
    "aesthetic",
    "learn",
    "daily",
  ];

  // Combine campaign themes + keywords + tone-specific tags
  const niche = uniq([
    ...campaign.themes,
    ...kw,
    ...(campaign.tone === "motivational"
      ? ["consistency", "discipline", "mindset", "goals"]
      : []),
    ...(campaign.tone === "fresh" ? ["springvibes", "newseason"] : []),
    ...(campaign.tone === "excited" ? ["gamechanger", "musthave"] : []),
    ...(campaign.tone === "curious" ? ["wanderlust", "bucketlist"] : []),
  ]);

  // One string → seed for stable regeneration behavior
  const s = hashSeed(`${campaignId}|${keywords}|${seed}`);

  // Create hashtags from base + niche
  const hashtags = uniq([
    ...seededPick(baseTags, s, 10),
    ...seededPick(niche, s + 17, 10),
  ])
    .slice(0, 18)
    .map(slugifyHashtag);

  const toneLine =
    campaign.tone === "motivational"
      ? "Let’s go 👊"
      : campaign.tone === "fresh"
      ? "Fresh vibes only ✨"
      : campaign.tone === "excited"
      ? "Big news 🚀"
      : "Come with me 👀";

  const kwLine = kw.length ? `\n\nKeywords: ${kw.slice(0, 6).join(", ")}` : "";

  // Caption templates (same structure, tailored by campaign)
  const captions = [
    {
      id: "hook-value-cta",
      title: "Hook → Value → CTA",
      text:
        `⚡ ${toneLine}\n\n` +
        `Here’s what you’ll get from this ${campaign.name.toLowerCase()}:\n` +
        `• [Benefit #1]\n• [Benefit #2]\n• [Benefit #3]\n\n` +
        `Which part should I break down next? Comment "[topic]" 👇` +
        kwLine,
    },
    {
      id: "storytime",
      title: "Storytime",
      text:
        `Storytime: I didn’t expect this to happen…\n\n` +
        `I was [doing X] when [surprise Y]. Here’s what I learned:\n` +
        `1) [Lesson]\n2) [Lesson]\n3) [Lesson]\n\n` +
        `Save this for later + share it with someone who needs it 💾` +
        kwLine,
    },
    {
      id: "before-after",
      title: "Before → After",
      text:
        `Before: [Pain point] 😩\n` +
        `After: [Result] ✅\n\n` +
        `What changed?\n` +
        `• [Change #1]\n• [Change #2]\n• [Change #3]\n\n` +
        `Want the exact steps? DM me "${campaign.themes[0] || "info"}" 📩` +
        kwLine,
    },
    {
      id: "quick-tips",
      title: "3 Quick Tips",
      text:
        `3 quick tips for ${campaign.name.toLowerCase()}:\n\n` +
        `1) [Tip]\n2) [Tip]\n3) [Tip]\n\n` +
        `Follow for more + tell me which one you’ll try today 👇` +
        kwLine,
    },
  ];

  // Shuffle captions based on seed for regeneration
  const order = seededPick(captions.map((c) => c.id), s + 99, captions.length);
  const shuffledCaptions = order
    .map((id) => captions.find((c) => c.id === id))
    .filter(Boolean);

  return { hashtags, captions: shuffledCaptions, campaign };
}

/**
 * Campaign list for dropdown
 */
export function getCampaignOptions() {
  return Object.entries(CAMPAIGN_MAP).map(([id, data]) => ({
    id,
    name: data.name,
  }));
}