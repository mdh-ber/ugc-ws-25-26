import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const fetchChartData = async (platform, startDate, endDate) => {
  const res = await axios.get(`${API_BASE}/clicks/chart`, {
    params: { platform, startDate, endDate },
  });
  return res.data;
};

export const fetchPlatforms = async () => {
  const res = await axios.get(`${API_BASE}/clicks/platforms`);
  return res.data;
};