import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  // Try to get token from store first
  const state = useAuthStore.getState();
  let token = state.token;
  
  // If store token is null, try to get from localStorage directly
  if (!token) {
    try {
      const stored = localStorage.getItem('hl-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed.state?.token;
      }
    } catch (e) {
      console.error('Failed to parse localStorage hl-auth:', e);
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle 401 - session expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    // Log other errors for debugging
    if (error.response?.status === 403) {
      console.error('API 403 Forbidden - Check authentication token and API permissions');
    }
    if (error.response?.status === 404) {
      console.error('API 404 Not Found - Endpoint may not exist on backend:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;