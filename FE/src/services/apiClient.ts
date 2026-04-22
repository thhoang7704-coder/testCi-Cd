import axios from "axios";

const baseURL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  // In dev, rely on Vite proxy (/api, /auth) to avoid CORS/preflight issues.
  ((import.meta as any).env?.DEV ? "" : "http://localhost:8082");

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if ((import.meta as any).env?.DEV) {
      const authHeader = (config.headers as any)?.Authorization;
      const hasAuth = Boolean(authHeader);
      const authPreview = typeof authHeader === 'string' ? authHeader.slice(0, 18) : undefined;
      console.debug('[apiClient]', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        hasAuth,
        authPreview,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
