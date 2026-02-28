import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

<<<<<<< HEAD
const api = axios.create({ baseURL: API_BASE_URL });

// Attach token on every request
api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

=======

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Always attach userid automatically
// api.interceptors.request.use((config) => {
//   config.headers.userid = USER_ID;
//   return config;
// });

>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
export default api;