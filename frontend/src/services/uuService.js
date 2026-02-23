import api from "./api";

// NOTE: pass params object like { days: 7 } from UI

export const getRefereeOverview = async (params) => {
  const res = await api.get("/uu/referee/overview", { params });
  return res.data;
};

export const getRefereeMembers = async (params) => {
  const res = await api.get("/uu/referee/members", { params });
  return res.data;
};

export const getRefereeDetails = async (refereeId, params) => {
  const res = await api.get(`/uu/referee/${refereeId}`, { params });
  return res.data;
};

export const getReferralOverview = async (params) => {
  const res = await api.get("/uu/referral/overview", { params });
  return res.data;
};

export const getReferralMembers = async (params) => {
  const res = await api.get("/uu/referral/members", { params });
  return res.data;
};

export const getReferralDetails = async (referralId, params) => {
  const res = await api.get(`/uu/referral/${referralId}`, { params });
  return res.data;
};