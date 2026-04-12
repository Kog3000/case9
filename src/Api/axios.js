import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pvz-backend.onrender.com', // URL вашего бэкенда
  headers: { 'Content-Type': 'application/json' }
});

// Перехватчик запроса: добавляем токен, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответа: при 401 разлогиниваем
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;