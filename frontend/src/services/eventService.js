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
  const response = await api.post("/events", formData, {
    headers: { 
      "x-user-role": getRoleHeader()
      // Notice: No Content-Type header here! Axios will handle it automatically.
    }
  });
  return response.data;
};

export const updateEvent = async (id, formData) => {
  const response = await api.put(`/events/${id}`, formData, {
    headers: { 
      "x-user-role": getRoleHeader()
      // Notice: No Content-Type header here!
    }
  });
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`, {
    headers: { "x-user-role": getRoleHeader() }
  });
  return response.data;
};

export const eventService = { getEvents, createEvent, updateEvent, deleteEvent };