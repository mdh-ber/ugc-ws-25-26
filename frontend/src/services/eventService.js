import api from "./api";

const getRoleHeader = () => {
  // Check both common keys to be safe
  const storedData = localStorage.getItem("userInfo") || localStorage.getItem("user");
  if (!storedData) return "";
  
  const user = JSON.parse(storedData);
  return user?.role || "";
};

export const getEvents = async () => {
  const response = await api.get("/events");
  return response.data;
};

export const createEvent = async (formData) => {
  return (await api.post("/events", formData, {
    headers: { "x-user-role": getRoleHeader() }
  })).data;
};

export const updateEvent = async (id, formData) => {
  return (await api.put(`/events/${id}`, formData, {
    headers: { "x-user-role": getRoleHeader() }
  })).data;
};

export const deleteEvent = async (id) => {
  return (await api.delete(`/events/${id}`, {
    headers: { "x-user-role": getRoleHeader() }
  })).data;
};

export const eventService = { getEvents, createEvent, updateEvent, deleteEvent };