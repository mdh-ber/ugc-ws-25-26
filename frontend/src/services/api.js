import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

//  HARDCODE USER ID HERE( For testing)
const USER_ID = "65d4f1e2b1c2d3e4f5a67890";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Always attach userid automatically
api.interceptors.request.use((config) => {
  config.headers.userid = USER_ID;
  return config;
});

export default api;