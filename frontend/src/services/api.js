import axios from "axios";

export const STORAGE_KEY = "cookthis_user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// Attach the login token to every request.
api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.token) {
      config.headers.Authorization = `Bearer ${stored.token}`;
    }
  } catch {
    // corrupted storage - treat as logged out
  }
  return config;
});

// Expired / invalid token -> clear the session and go back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.assign("/");
    }
    return Promise.reject(error);
  }
);

/** Best human-readable message from a failed request. */
export function errorMessage(err, fallback) {
  return (
    err.response?.data?.message ||
    (typeof err.response?.data === "string" ? err.response.data : null) ||
    fallback
  );
}

export default api;
