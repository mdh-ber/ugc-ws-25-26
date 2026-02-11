import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";


const api = axios.create({
  baseURL: API_BASE_URL,
});

// Always attach userid automatically
api.interceptors.request.use((config) => {
  config.headers.userid = USER_ID;
  return config;
});

export default api;