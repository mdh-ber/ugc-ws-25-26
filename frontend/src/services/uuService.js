import api from "./api";

// ----------- REFEREE -----------
export const getRefereeOverview = async ({ days = 7 } = {}) => {
  const res = await api.get(`/uu/referee/overview?days=${days}`);
  return res.data;
};

export const getRefereeMembers = async ({ days = 7 } = {}) => {
  const res = await api.get(`/uu/referee/members?days=${days}`);
  return res.data;
};

export const getRefereeDetails = async (refereeId, { days = 7 } = {}) => {
  const res = await api.get(`/uu/referee/${refereeId}?days=${days}`);
  return res.data;
};

// ----------- REFERRAL -----------
export const getReferralOverview = async ({ days = 7 } = {}) => {
  const res = await api.get(`/uu/referral/overview?days=${days}`);
  return res.data;
};

export const getReferralMembers = async ({ days = 7 } = {}) => {
  const res = await api.get(`/uu/referral/members?days=${days}`);
  return res.data;
};

export const getReferralDetails = async (referralId, { days = 7 } = {}) => {
  const res = await api.get(`/uu/referral/${referralId}?days=${days}`);
  return res.data;
};