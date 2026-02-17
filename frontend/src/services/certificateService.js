// src/services/certificateService.js
import axios from "axios";

const API = "/api/certificates";

export const getCertificates = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getCertificateById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};
