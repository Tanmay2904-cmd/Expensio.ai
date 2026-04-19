import axios from 'axios';

const BACKEND_URL = 'https://expensio-ai.onrender.com';

// 🔥 Wake up Render backend on app load (fire-and-forget, no interval yet)
axios.get(`${BACKEND_URL}/actuator/health`).catch(() => { });

let pingInterval = null;

export const startBackendPing = () => {
  // Keep backend alive — ping every 14 minutes (only when logged in)
  if (!pingInterval) {
    pingInterval = setInterval(() => {
      axios.get(`${BACKEND_URL}/actuator/health`).catch(() => { });
    }, 14 * 60 * 1000);
  }
};

export const stopBackendPing = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 90000, // 90s to allow Render cold-start (~60s)
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  (error) => {
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