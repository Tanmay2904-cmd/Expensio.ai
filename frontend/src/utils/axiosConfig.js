import axios from 'axios';

// Create an axios instance with interceptors
const axiosInstance = axios.create();

// Request interceptor - add JWT token to all requests
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

// Response interceptor - unwrap ApiResponse wrapper
axiosInstance.interceptors.response.use(
  (response) => {
    // If response has ApiResponse structure, unwrap it
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return {
        ...response,
        data: response.data.data, // Extract the actual data from ApiResponse wrapper
      };
    }
    return response;
  },
  (error) => {
    // Handle error responses - backend may use 'message' (ApiResponse) or 'error' (GlobalExceptionHandler)
    const data = error.response?.data;
    if (data?.message) {
      error.message = data.message;
    } else if (data?.error) {
      error.message = data.error;
    }
      // Auto-logout on auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        window.location.href = '/login';
        return;
      }
      return Promise.reject(error);
    }
  );


export default axiosInstance;
