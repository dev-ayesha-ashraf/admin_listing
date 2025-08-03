import axios from "axios";

const API2_BASE_URL = import.meta.env.VITE_API2_URL;

const api2 = axios.create({
  baseURL: API2_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api2;
