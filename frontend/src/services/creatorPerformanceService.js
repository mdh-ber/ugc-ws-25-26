import api from "./api";

export async function getClicksPerCreator() {
  const res = await api.get("/analytics/clicks-per-creator");
  return res.data;
}
export async function getCreatorPerformance({ from, to, bucket = "daily", creatorId = null }) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  return {
    range: { from, to, bucket, creatorId },

    clicks: [
      { date: "2026-02-01", count: 10, cumulative: 10 },
      { date: "2026-02-02", count: 5, cumulative: 15 },
      { date: "2026-02-03", count: 0, cumulative: 15 },
      { date: "2026-02-04", count: 12, cumulative: 27 },
    ],

    leads: [
      { date: "2026-02-01", count: 2, cumulative: 2 },
      { date: "2026-02-02", count: 1, cumulative: 3 },
      { date: "2026-02-03", count: 0, cumulative: 3 },
      { date: "2026-02-04", count: 3, cumulative: 6 },
    ],

    platforms: [
      {
        platform: "instagram",
        series: [
          { date: "2026-02-01", count: 4, cumulative: 4 },
          { date: "2026-02-02", count: 2, cumulative: 6 },
          { date: "2026-02-03", count: 0, cumulative: 6 },
          { date: "2026-02-04", count: 5, cumulative: 11 },
        ],
      },
      {
        platform: "youtube",
        series: [
          { date: "2026-02-01", count: 6, cumulative: 6 },
          { date: "2026-02-02", count: 3, cumulative: 9 },
          { date: "2026-02-03", count: 0, cumulative: 9 },
          { date: "2026-02-04", count: 7, cumulative: 16 },
        ],
      },
    ],
  };
  
}