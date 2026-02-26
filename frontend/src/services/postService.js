import api from "./api"; // Your existing axios instance

export const getFeed = async (sort = "newest", page = 1) => {
  const response = await api.get(`/posts?sort=${sort}&page=${page}`);
  return response.data;
};

export const createPost = async (postData) => {
  // If handling actual files, we'd use FormData. 
  // Assuming a standard JSON payload for now (e.g., if you upload to Cloudinary first)
  const response = await api.post("/posts", postData);
  return response.data;
};

export const toggleLike = async (postId) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

export const addComment = async (postId, text) => {
  const response = await api.post(`/posts/${postId}/comment`, { text });
  return response.data;
};

export const getComments = async (postId) => {
  const response = await api.get(`/posts/${postId}/comment`);
  return response.data;
};

export const reportPost = async (postId) => {
  const response = await api.post(`/posts/${postId}/report`);
  return response.data;
};