// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, logout as apiLogout } from '../Api/auth';
import { getFullImageUrl } from '../Api/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData) => {
    if (!userData) return null;

    const normalizedAvatar = getFullImageUrl(
      userData.image_url || userData.avatar
    );

    return {
      ...userData,
      image_url: normalizedAvatar || userData.image_url || null,
      avatar: normalizedAvatar || userData.avatar || null
    };
  };

  // Загрузка сохранённого пользователя при монтировании
  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      const normalizedUser = normalizeUser(storedUser);
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    setLoading(false);
  }, []);

  // Подписка на событие обновления данных пользователя
  useEffect(() => {
    const handleUserDataUpdate = (event) => {
      const { name, avatar, image_url, ...rest } = event.detail || {};

      if (!name && !avatar && !image_url && Object.keys(rest).length === 0) {
        return;
      }

      setUser(prevUser => {
        const updated = {
          ...(prevUser || {})
        };

        if (name) {
          updated.name = name;
        }

        const incomingAvatar = image_url || avatar;

        if (incomingAvatar) {
          const normalizedAvatar = getFullImageUrl(incomingAvatar);

          updated.image_url = normalizedAvatar;
          updated.avatar = normalizedAvatar;
        }

        Object.assign(updated, rest);

        localStorage.setItem('user', JSON.stringify(updated));

        return updated;
      });
    };

    window.addEventListener('userDataUpdate', handleUserDataUpdate);

    return () => {
      window.removeEventListener('userDataUpdate', handleUserDataUpdate);
    };
  }, []);

  const loginUser = (userData) => {
    const normalizedUser = normalizeUser(userData);

    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const logoutUser = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};