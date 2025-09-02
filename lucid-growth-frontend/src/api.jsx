import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000/api" });

// Create new session
export const createSession = () => API.post("/sessions/create");

// Get session by ID
export const getSession = (id) => API.get(`/sessions/${id}`);

// Fetch email results
export const fetchEmail = (subject) => API.get(`/emails/fetch?subject=${subject}`);
