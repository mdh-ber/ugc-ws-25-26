// frontend/src/services/milestoneService.js
import axios from "axios";

// ✅ Set this in .env if needed:
// REACT_APP_MILESTONES_API=http://localhost:5004
// If not set, defaults to 5004 (your milestones service)
const MILESTONES_API =
  process.env.REACT_APP_MILESTONES_API || "http://localhost:5004";

const milestoneApi = axios.create({
  baseURL: MILESTONES_API,
  timeout: 12000,
});

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMilestoneTypes() {
  const res = await milestoneApi.get("/milestone-types");
  return res.data || [];
}

export async function getUserMilestones(creatorId) {
  const res = await milestoneApi.get(`/user-milestones/${creatorId}`, {
    headers: authHeaders(),
  });
  return res.data || [];
}

export async function getBestCreatorsMonth() {
  const res = await milestoneApi.get("/leaderboards/best-creators-month");
  return res.data || [];
}

export async function getBestCreatorByCity(cities) {
  const res = await milestoneApi.get("/leaderboards/best-creator-by-city", {
    params: { cities },
  });
  return res.data || { Berlin: null, Düsseldorf: null };
}