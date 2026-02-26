// src/services/creatorPerformanceService.js
import axios from "axios";

/**
 * Webpack/CRA-safe env var (NO import.meta).
 * Set in frontend/.env as:
 * REACT_APP_API_URL=http://localhost:5000
 */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getToken() {
  return sessionStorage.getItem("token") || localStorage.getItem("token") || "";
}

/**
 * GET /api/mdh/creator-performance
 * params:
 *  - from (YYYY-MM-DD)
 *  - to (YYYY-MM-DD)
 *  - bucket (auto | hourly | daily | weekly | monthly)
 *  - creatorId (optional)
 *  - platforms (optional) comma-separated e.g. "instagram,youtube"
 */
export async function getCreatorPerformance({
  from,
  to,
  bucket = "auto",
  creatorId = null,
  platforms = [], // array of strings
}) {
  if (!from || !to) {
    throw new Error("from and to are required (YYYY-MM-DD)");
  }

  const token = getToken();

  try {
    const res = await axios.get(`${API_BASE}/api/mdh/creator-performance`, {
      params: {
        from,
        to,
        bucket,
        ...(creatorId ? { creatorId } : {}),
        ...(platforms?.length ? { platforms: platforms.join(",") } : {}),
      },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to fetch creator performance data";
    const status = err?.response?.status;
    throw new Error(status ? `${msg} (HTTP ${status})` : msg);
  }
}