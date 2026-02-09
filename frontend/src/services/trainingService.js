import api from "./api";

// Get all trainings
export const getTrainings = async () => {
  try {
    const response = await api.get("/trainings");
    return response.data; // assuming response.data is an array of trainings
  } catch (error) {
    console.error("Error fetching trainings:", error);
    throw error;
  }
};

// Get single training by ID (optional)
export const getTrainingById = async (id) => {
  try {
    const response = await api.get(`/trainings/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching training:", error);
    throw error;
  }
};
