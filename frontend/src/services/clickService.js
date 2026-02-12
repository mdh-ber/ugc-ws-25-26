import api from './api';

export const clickService = {
  // Log a click event
  logClick: (clickData) => api.post('/clicks', clickData),
  
  // Get click statistics with filters
  getClickStats: (params) => api.get('/clicks/stats', { params }),
  
  // Get all clicks
  getClicks: (params) => api.get('/clicks', { params })
};
