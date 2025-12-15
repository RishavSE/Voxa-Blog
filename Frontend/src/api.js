// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // Make sure this matches your backend
});

export default API;
