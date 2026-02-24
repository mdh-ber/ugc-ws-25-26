<<<<<<< Updated upstream
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
=======
export const getClicksPerCreator = async () => {
  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      creatorId: "1",
      creatorName: "Emma Johnson",
      totalClicks: 320,
    },
    {
      creatorId: "2",
      creatorName: "Liam Brown",
      totalClicks: 275,
    },
    {
      creatorId: "3",
      creatorName: "Sophia Lee",
      totalClicks: 190,
    },
  ];
>>>>>>> Stashed changes
};