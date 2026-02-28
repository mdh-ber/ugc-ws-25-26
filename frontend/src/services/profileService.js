import api from "./api";

export const getProfile = async () => {
  const res = await api.get("/user-profile/me");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/user-profile/me", data);
  return res.data;
};
