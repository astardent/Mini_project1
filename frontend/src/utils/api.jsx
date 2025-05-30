// src/utils/api.js
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // If you can access context here, not typical for a utility
                                                  // More commonly, you'd get token from localStorage directly

const api = axios.create({
  baseURL: '/api', // Your API base URL, matches your Vite proxy
  
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // If the request data is FormData, delete the default Content-Type header
    // to allow the browser/Axios to set the correct multipart/form-data header with boundary.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      // If no Content-Type is set and it's not FormData, default to application/json
      // This line is only needed if you removed the default Content-Type from axios.create()
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling (e.g., 401 for logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., by logging out the user
      // This depends on how you want to manage global auth errors.
      // You might dispatch a logout action or redirect to login.
      // For simplicity, we'll just log it here.
      console.error("API request Unauthorized (401):", error.response.data);
      // Example: localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;