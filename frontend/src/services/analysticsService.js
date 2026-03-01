import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getClicksPerCreator = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/analytics/clicks-per-creator`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching clicks per creator:", error);
    throw error;
  }
};