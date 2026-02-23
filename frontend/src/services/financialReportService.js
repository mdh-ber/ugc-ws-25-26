import api from "./api";

// 1️⃣ Campaign vs Campaign Comparison
export const compareCampaigns = async (campaignIds = []) => {
  const params = new URLSearchParams();
  console.log("Comparing campaigns:", campaignIds);
  params.append("campaignIds", campaignIds.join(","));
  const res = await api.get(`/financial-report/compare?${params.toString()}`);
  return res.data;
};

// 2️⃣ Campaign Actual Spending vs ROI
export const spentVsROI = async () => {
  const res = await api.get("/financial-report/roi");
  return res.data;
};

// 3️⃣ Time Series capture
export const getTimeSeries = async (period = "month") => {
  const params = new URLSearchParams();
  params.append("period", period);
  const res = await api.get(`/financial-report/timeseries?${params.toString()}`);
  return res.data;
};

// 4️⃣ Cost Per Click (CPC)
export const getCostPerClick = async (campaignId) => {
  const params = new URLSearchParams();
  if (campaignId) params.append("campaignId", campaignId);
  const res = await api.get(`/financial-report/cpc?${params.toString()}`);
  return res.data;
};

// 5️⃣ Click Through Rate (CTR)
export const getClickThroughRate = async (campaignId) => {
  const params = new URLSearchParams();
  if (campaignId) params.append("campaignId", campaignId);
  const res = await api.get(`/financial-report/ctr?${params.toString()}`);
  return res.data;
};