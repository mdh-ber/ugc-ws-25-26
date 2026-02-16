import api from "./api";

// REFEREE
export const getRefereeOverview = async () => {
  const res = await api.get("/uu/referee/overview");
  return res.data;
};

export const getReferralOverview = async () => {
  const res = await api.get("/uu/referral/overview");
  return res.data;
};