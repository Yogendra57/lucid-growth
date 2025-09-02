import axios from "axios";

const API = axios.create({ baseURL: "https://lucid-growth-backend-urq3.onrender.com/api" });

// Create new session
export const createSession = () => API.post("/sessions/create");

// Get session by ID
export const getSession = (id) => API.get(`/sessions/${id}`);

// Fetch email results
export const fetchEmail = (subject) => API.get(`/emails/fetch?subject=${subject}`);
