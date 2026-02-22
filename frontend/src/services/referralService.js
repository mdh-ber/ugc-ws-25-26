import api from "./api";

// Get all referrals
export const getReferrals = async () => {
  try {
    const response = await api.get("/referrals");
    return response.data; // assuming response.data is an array of referrals
  } catch (error) {
    console.error("Error fetching referrals:", error);
    throw error;
  }
};

// Get single referral by ID (optional)
export const getReferralById = async (id) => {
  try {
    const response = await api.get(`/referrals/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching referral:", error);
    throw error;
  }
};

// Create new referral
export const createReferral = async (referralData) => {
  try {
    const response = await api.post("/referrals", referralData);
    return response.data.referral; // Extract the referral object from the response
  } catch (error) {
    console.error("Error creating referral:", error);
    throw error;
  }
};

// Update referral
export const updateReferral = async (id, referralData) => {
  try {
    console.log("Form Data:", referralData, id);

    const response = await api.put(`/referrals/${id}`, referralData);
    return response.data.referral; // Extract the referral object from the response
  } catch (error) {
    console.error("Error updating referral:", error);
    throw error;
  }
};

// Delete referral
export const deleteReferral = async (id) => {
  try {
    const response = await api.delete(`/referrals/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting referral:", error);
    throw error;
  }
};