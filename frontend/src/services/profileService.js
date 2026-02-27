import api from "./api";
export const getProfile = async (userId) => {
  const res = await api.get(`/profiles/${userId}`);
  return res.data;
};

export const updateProfile = async (formData, userId) => {
  const res = await api.put(`/profiles/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

