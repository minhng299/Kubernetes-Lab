import axios from 'axios';

// Backend is running in Docker Desktop Kubernetes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:31998/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout for Kubernetes
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if(token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
