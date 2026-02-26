// src/services/creatorPerformanceService.js

// MOCK DATABASE
const MOCK_DB = {
  creator_1: {
    clicks: [12, 8, 5, 15],
    leads: [3, 1, 2, 4],
    instagram: [6, 4, 2, 7],
    youtube: [6, 4, 3, 8],
  },
  creator_2: {
    clicks: [5, 6, 4, 7],
    leads: [1, 2, 1, 2],
    instagram: [3, 3, 2, 4],
    youtube: [2, 3, 2, 3],
  },
};

const DATES = [
  "2026-02-01",
  "2026-02-02",
  "2026-02-03",
  "2026-02-04",
];

function buildSeries(values) {
  let cumulative = 0;

  return values.map((v, i) => {
    cumulative += v;
    return {
      date: DATES[i],
      count: v,
      cumulative,
    };
  });
}

function buildPlatformSeries(insta, yt) {
  return [
    {
      platform: "instagram",
      series: buildSeries(insta),
    },
    {
      platform: "youtube",
      series: buildSeries(yt),
    },
  ];
}

export async function getCreatorPerformance({
  from,
  to,
  bucket = "daily",
  creatorId = null,
}) {
  // simulate backend delay
  await new Promise((r) => setTimeout(r, 400));

  // If creator ID is provided
  if (creatorId) {
    const creator = MOCK_DB[creatorId];

    if (!creator) {
      return {
        clicks: [],
        leads: [],
        platforms: [],
      };
    }

    return {
      range: { from, to, bucket, creatorId },
      clicks: buildSeries(creator.clicks),
      leads: buildSeries(creator.leads),
      platforms: buildPlatformSeries(
        creator.instagram,
        creator.youtube
      ),
    };
  }

  // If no creator ID → return aggregated data
  const allCreators = Object.values(MOCK_DB);

  const totalClicks = DATES.map((_, i) =>
    allCreators.reduce((sum, c) => sum + c.clicks[i], 0)
  );

  const totalLeads = DATES.map((_, i) =>
    allCreators.reduce((sum, c) => sum + c.leads[i], 0)
  );

  const totalInsta = DATES.map((_, i) =>
    allCreators.reduce((sum, c) => sum + c.instagram[i], 0)
  );

  const totalYT = DATES.map((_, i) =>
    allCreators.reduce((sum, c) => sum + c.youtube[i], 0)
  );

  return {
    range: { from, to, bucket, creatorId },
    clicks: buildSeries(totalClicks),
    leads: buildSeries(totalLeads),
    platforms: buildPlatformSeries(totalInsta, totalYT),
  };
}