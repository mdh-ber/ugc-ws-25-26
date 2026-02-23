import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Check for token in both session and local storage
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;