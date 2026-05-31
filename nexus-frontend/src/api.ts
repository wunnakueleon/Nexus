import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Interim identity: the backend has no JWT yet, so we tell it which operator is
// signed in via a header. Kept in a module-level variable (updated from the app
// context) and attached to every request below.
let currentUsername: string | null = null;
export const setAuthUsername = (username: string | null) => {
  currentUsername = username;
};

api.interceptors.request.use(config => {
  if (currentUsername) config.headers["x-username"] = currentUsername;
  return config;
});

export default api;
