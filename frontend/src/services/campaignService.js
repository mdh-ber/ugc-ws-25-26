import api from "./api"; // you already have this file

export const getCampaigns = async () => {
  const res = await api.get("/campaigns");
  return res.data;
};

export const getCampaignById = async (id) => {
  const res = await api.get(`/campaigns/${id}`);
  return res.data;
};

export const createCampaign = async (payload) => {
  const res = await api.post("/campaigns", payload);
  return res.data;
};

export const updateCampaign = async (id, payload) => {
  const res = await api.put(`/campaigns/${id}`, payload);
  return res.data;
};

export const deleteCampaign = async (id) => {
  const res = await api.delete(`/campaigns/${id}`);
  return res.data;
};