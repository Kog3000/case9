// src/Api/auth.js - полная версия
import api from './axios';
import { jwtDecode } from 'jwt-decode';

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
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const getUserFromToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      email: decoded.sub,
      role: decoded.role,
      id: decoded.id,
    };
  } catch {
    return null;
  }
};

// Не забудьте export default, если он нужен
export default {
  login,
  logout,
  getStoredUser,
  getUserFromToken
};