import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Don't emit event if we are actively trying to login or check profile on load
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/profile')) {
        window.dispatchEvent(new CustomEvent('retailvision:auth_error'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
