import { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromToken, logout as apiLogout } from '../Api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Восстанавливаем сессию при загрузке
    const userData = getUserFromToken();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
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

export const useAuth = () => useContext(AuthContext);