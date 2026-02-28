import axios from "axios";
const API_URL = "http://localhost:5000/api";

export const getClicksPerCreator = async () => {
  const response = await axios.get(
    `${API_URL}/analytics/clicks-per-creator`
  );
  return response.data;
};

export const getCreatorPerformance = async (creatorId) => {
  const response = await axios.get(
    `${API_URL}/analytics/creator-performance/${creatorId}`
  );
  return response.data;
};