import api from "./api";

// REFEREE
export const getRefereeOverview = async () => {
  const res = await api.get("/uu/referee/users");
  return res.data;
};

export const getReferralOverview = async () => {
  const res = await api.get("/uu/referral/users");
  return res.data;
};