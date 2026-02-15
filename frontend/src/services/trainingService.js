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

// Create new training
export const createTraining = async (trainingData) => {
  try {
    const response = await api.post("/trainings", trainingData);
    return response.data.training; // Extract the training object from the response
  } catch (error) {
    console.error("Error creating training:", error);
    throw error;
  }
};

// Update training
export const updateTraining = async (id, trainingData) => {
  try {
    console.log("Form Data:", trainingData, id);

    const response = await api.put(`/trainings/${id}`, trainingData);
    return response.data.training; // Extract the training object from the response
  } catch (error) {
    console.error("Error updating training:", error);
    throw error;
  }
};

// Delete training
export const deleteTraining = async (id) => {
  try {
    const response = await api.delete(`/trainings/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting training:", error);
    throw error;
  }
};

// Get hashtag suggestions for autocomplete
export const getHashtagSuggestions = async (query) => {
  try {
    const response = await api.get(`/trainings/hashtag-suggestions?query=${encodeURIComponent(query)}`);
    return response.data; // assuming response.data is an array of hashtag strings
  } catch (error) {
    console.error("Error fetching hashtag suggestions:", error);
    throw error;
  }
};
