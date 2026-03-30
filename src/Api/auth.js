import api from './axios';
import { jwtDecode } from 'jwt-decode';

// Регистрация
export const register = async (email, password, role) => {
  const response = await api.post('/users/', { email, password, role });
  return response.data;
};

// Логин (OAuth2 password flow)
export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post('/users/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }
  return response.data;
};

// Выход
export const logout = () => {
  localStorage.removeItem('access_token');
};

// Получение данных пользователя из токена
export const getUserFromToken = () => {
  const token = localStorage.getItem('access_token');
  console.log('Token from localStorage:', token);
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);
    return {
      email: decoded.sub,
      role: decoded.role,
      id: decoded.id,
      name: decoded.role,
      displayName: decoded.sub
    };
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    return null;
  }
};
