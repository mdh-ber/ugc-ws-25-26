import api from "./api";

<<<<<<< HEAD
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
=======
// REFEREE
export const getRefereeOverview = async () => {
  const res = await api.get("/uu/referee/overview");
  return res.data;
};

export const getReferralOverview = async () => {
  const res = await api.get("/uu/referral/overview");
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
  return res.data;
};