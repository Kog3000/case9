// src/Api/auth.js
import api from './axios';
import { jwtDecode } from 'jwt-decode';
import { getFullImageUrl, STORAGE_KEYS } from './userService';

export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post('/users/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const { access_token, user } = response.data;

  if (access_token) {
    localStorage.setItem('access_token', access_token);
  }

  if (user) {
    const normalizedUser = {
      ...user,
      image_url: getFullImageUrl(user.image_url)
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));

    if (normalizedUser.id !== undefined && normalizedUser.id !== null) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, String(normalizedUser.id));
    }

    if (normalizedUser.name) {
      localStorage.setItem(STORAGE_KEYS.USER_NAME, normalizedUser.name);
      localStorage.setItem(STORAGE_KEYS.USER_DISPLAY_NAME, normalizedUser.name);
    }

    if (normalizedUser.email) {
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, normalizedUser.email);
    }

    if (normalizedUser.role) {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, normalizedUser.role);
    }

    if (normalizedUser.image_url) {
      localStorage.setItem(STORAGE_KEYS.USER_AVATAR, normalizedUser.image_url);
    }

    return {
      ...response.data,
      user: normalizedUser
    };
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    return null;
  }

  try {
    const user = JSON.parse(userStr);

    return {
      ...user,
      image_url: getFullImageUrl(user.image_url)
    };
  } catch {
    return null;
  }
};

export const getUserFromToken = () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    return {
      email: decoded.sub,
      role: decoded.role,
      id: decoded.id,
      image_url: getFullImageUrl(decoded.image_url)
    };
  } catch {
    return null;
  }
};

export default {
  login,
  logout,
  getStoredUser,
  getUserFromToken
};