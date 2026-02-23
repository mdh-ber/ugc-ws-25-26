import api from './api';

export const getLeadStats = async () => {
  const response = await api.get('/leads/stats');
  return response.data;
};

// Simulates a user submitting a form from an ad
export const createDummyLead = async (leadData) => {
  const response = await api.post('/leads', leadData);
  return response.data;
};