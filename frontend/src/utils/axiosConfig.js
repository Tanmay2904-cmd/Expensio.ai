import axios from 'axios';

const getBackendURL = () => {
  if (typeof window === 'undefined') return 'http://localhost:8080';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8080';
  return 'https://expensio-ai.onrender.com';
};
const BACKEND_URL = getBackendURL();

// Wake up Render backend on app load
axios.get(`${BACKEND_URL}/actuator/health`).catch(() => { });

// Keep alive interval
let pingInterval = null;

export const startBackendPing = () => {
  if (pingInterval) return;
  pingInterval = setInterval(() => {
    axios.get(`${BACKEND_URL}/actuator/health`).catch(() => { });
  }, 14 * 60 * 1000);
};

export const stopBackendPing = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 90000, // ✅ 60s se 90s — Render cold start ke liye
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ✅ Samsung browser ke liye explicit headers
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    config.headers['Accept'] = 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  (error) => {
    // ✅ Network error handle karo — Samsung/mobile pe timeout aata hai
    if (!error.response) {
      error.message = 'Network error — please check your connection or try again.';
      return Promise.reject(error);
    }

    const data = error.response?.data;
    if (data?.message) {
      error.message = data.message;
    } else if (data?.error) {
      error.message = data.error;
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');

      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;