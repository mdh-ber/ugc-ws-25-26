import api from "./api";

// ===== GET PROFILE =====
export const getProfile = async () => {
  const res = await api.get("/profiles");
  return res.data;
};

// ===== UPDATE PROFILE =====
export const updateProfile = async (profileData) => {
  const res = await api.put("/profiles", profileData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
