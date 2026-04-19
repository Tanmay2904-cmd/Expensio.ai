import axios from 'axios';

// Use relative paths to rely on Vite proxy in dev and Firebase rewrites in prod
const BACKEND_URL = '';

// The keep-alive ping is no longer strictly needed for Render since we move to Cloud Run / Firebase.
// Cloud Run cold starts are minimal and handled via standard autoscaling.
export const startBackendPing = () => { };
export const stopBackendPing = () => { };

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
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