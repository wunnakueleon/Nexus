import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// The signed-in operator's JWT. Set on sign-in/sign-up, cleared on sign-out or
// when the server rejects it (401). Attached as a Bearer header on every request.
let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use(config => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// If the server rejects our token (expired/invalid) while we believed we were
// signed in, drop the dead token and bounce back to the landing page to
// re-authenticate. We only react when a token was actually attached, so a 401
// from a failed sign-in attempt still surfaces to the form as an error.
api.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401 && authToken) {
      authToken = null;
      if (window.location.pathname !== "/") window.location.assign("/");
    }
    return Promise.reject(error);
  },
);

export default api;
