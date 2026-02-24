import { useMemo, useState } from "react";

const PLATFORMS = ["All", "Instagram", "TikTok", "YouTube", "LinkedIn", "Twitter"];
const POST_TYPES = ["All", "Reel", "Short", "Carousel", "Post", "Story", "Thread"];
const GOALS = ["All", "More Views", "More Followers", "More Saves", "More Leads"];
const DIFFICULTY = ["All", "Easy", "Medium", "Hard"];

// Mock data (replace with backend later)
const initialSuggestions = [
  {
    id: 1,
    title: "3 mistakes beginners make (fast cuts)",
    hook: "Stop doing this if you want faster results…",
    topics: ["Beginner Tips", "Common Mistakes", "Quick Wins"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    postType: "Short",
    goal: "More Views",
    difficulty: "Easy",
    bestTime: "7–9 PM",
    media: {
      kind: "Video",
      durationSec: 20,
      aspectRatio: "9:16",
      shotList: ["Face cam intro", "Text overlays", "Example clip", "CTA: follow/save"],
      bRollIdeas: ["screen recording", "before/after", "close-up hands"],
    },
    hashtags: ["#creator", "#tips", "#learnfast", "#contentstrategy"],
    externalLinks: [
      { label: "Hook formulas", url: "https://example.com/hooks" },
      { label: "Shorts best practices", url: "https://example.com/shorts" },
    ],
    status: "NEW", // NEW | SAVED | USED
  },
  {
    id: 2,
    title: "Before/After transformation (process + result)",
    hook: "This took me 30 minutes—here’s the full breakdown.",
    topics: ["Transformation", "Workflow", "Behind the Scenes"],
    platforms: ["Instagram", "TikTok"],
    postType: "Reel",
    goal: "More Saves",
    difficulty: "Medium",
    bestTime: "6–8 PM",
    media: {
      kind: "Video",
      durationSec: 30,
      aspectRatio: "9:16",
      shotList: ["Before shot", "3-step process", "After reveal", "CTA: save this"],
      bRollIdeas: ["timelapse", "tool close-ups", "final reveal"],
    },
    hashtags: ["#beforeafter", "#workflow", "#howto", "#reels"],
    externalLinks: [{ label: "Editing pacing guide", url: "https://example.com/editing" }],
    status: "NEW",
  },
  {
    id: 3,
    title: "Myth vs Truth (1 myth, 1 truth, 1 tip)",
    hook: "Everyone thinks this is true… it’s not.",
    topics: ["Myth Busting", "Education", "Credibility"],
    platforms: ["LinkedIn", "Twitter"],
    postType: "Post",
    goal: "More Followers",
    difficulty: "Easy",
    bestTime: "9–11 AM",
    media: {
      kind: "Image",
      durationSec: null,
      aspectRatio: "1:1",
      shotList: ["Simple graphic: Myth/Truth", "Caption with 1 tip"],
      bRollIdeas: [],
    },
    hashtags: ["#insights", "#careertips", "#mythbusting"],
    externalLinks: [
      { label: "Reference article", url: "https://example.com/reference" },
      { label: "Stats source", url: "https://example.com/stats" },
    ],
    status: "NEW",
  },
];

function Pill({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    NEW: "bg-blue-100 text-blue-700",
    SAVED: "bg-purple-100 text-purple-700",
    USED: "bg-green-100 text-green-700",
  };
  const label = status === "NEW" ? "New" : status === "SAVED" ? "Saved" : "Used";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {label}
    </span>
  );
}

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [postType, setPostType] = useState("All");
  const [goal, setGoal] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = useMemo(() => {
    return suggestions
      .filter((s) =>
        `${s.title} ${s.hook} ${s.topics.join(" ")}`.toLowerCase().includes(search.toLowerCase())
      )
      .filter((s) => (platform === "All" ? true : s.platforms.includes(platform)))
      .filter((s) => (postType === "All" ? true : s.postType === postType))
      .filter((s) => (goal === "All" ? true : s.goal === goal))
      .filter((s) => (difficulty === "All" ? true : s.difficulty === difficulty));
  }, [suggestions, search, platform, postType, goal, difficulty]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  const toggleSave = (id) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "SAVED" ? "NEW" : "SAVED" } : s
      )
    );
  };

  const markUsed = (id) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "USED" } : s)));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Post Suggestions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Suggestions include topics, media plan, hashtags, links, and post type.
          </p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
          Generate new ideas
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, hook, topic..."
          className="md:col-span-2 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-white"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-white"
        >
          {POST_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-white"
        >
          {GOALS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-white"
        >
          {DIFFICULTY.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{s.hook}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>

            {/* Topics + metadata */}
            <div className="mt-3 flex flex-wrap gap-2">
              {s.topics.map((t) => (
                <Pill key={t} tone="blue">{t}</Pill>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="gray">{s.postType}</Pill>
              <Pill tone="purple">{s.goal}</Pill>
              <Pill tone="yellow">{s.difficulty}</Pill>
              <Pill tone="green">Best: {s.bestTime}</Pill>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <span className="font-semibold">Platforms:</span> {s.platforms.join(", ")}
            </div>

            {/* Media block */}
            <div className="mt-4 rounded-lg border bg-gray-50 p-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Pill>{s.media.kind}</Pill>
                <Pill>AR: {s.media.aspectRatio}</Pill>
                {typeof s.media.durationSec === "number" && <Pill>{s.media.durationSec}s</Pill>}
              </div>

              <div className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Media plan:</span>
                <ul className="list-disc pl-5 mt-1 text-gray-600">
                  {s.media.shotList.map((x, idx) => (
                    <li key={idx}>{x}</li>
                  ))}
                </ul>
              </div>

              {s.media.bRollIdeas?.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">B-roll ideas:</span>{" "}
                  <span className="text-gray-600">{s.media.bRollIdeas.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Hashtags */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">Hashtags</div>
                <button
                  onClick={() => copyText(s.hashtags.join(" "))}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Copy hashtags
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {s.hashtags.map((h) => (
                  <span
                    key={h}
                    className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* External links */}
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-800">External links</div>
              <div className="mt-2 flex flex-col gap-1">
                {s.externalLinks?.length ? (
                  s.externalLinks.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-700 hover:underline"
                    >
                      {l.label}
                    </a>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No links</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSave(s.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                    s.status === "SAVED"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {s.status === "SAVED" ? "Saved" : "Save"}
                </button>

                <button
                  onClick={() => markUsed(s.id)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
                >
                  Mark used
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyText(s.hook)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200"
                >
                  Copy hook
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 text-center text-sm text-gray-600">
          No suggestions match your filters.
        </div>
      )}
    </div>
  );
}