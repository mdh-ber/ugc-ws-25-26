import api from "./api";

// Helper to get role from local storage
const getRoleHeader = () => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  return { "user-role": user?.role || "Student" };
};

export const getEvents = async () => {
  const response = await api.get("/events");
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post("/events", eventData, { headers: getRoleHeader() });
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`, { headers: getRoleHeader() });
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/events/${id}`, eventData, { headers: getRoleHeader() });
  return response.data;
};