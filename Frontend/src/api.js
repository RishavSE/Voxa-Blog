// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://voxa-blog.onrender.com/api", // Make sure this matches your backend
});

export default API;
