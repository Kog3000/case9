import { useState, useEffect } from 'react';
import Header from './Header/Header';
import ProfilePage from './ProfilePage/ProfilePage';
import './App.css';
import OperatorPage from './OperatorPage/OperatorPage';
import RegisterPage from './RegisterPage/RegisterPage';
import SupervisorPage from './SupervisorPage/SupervisorPage';
import AnalystPage from './AnalystPage';
import { useAuth } from './Context/AuthContext';
import { fetchUserProfile, clearAllUserData } from './Api/userService';

function App() {
  const { user, loading, loginUser, logoutUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('register');
  const [currentUserData, setCurrentUserData] = useState(user);

  // Обновляем локальное состояние при изменении user из контекста
  useEffect(() => {
    if (user) {
      setCurrentUserData(user);
    }
  }, [user]);

  // Восстановление сессии при монтировании (по токену)
  useEffect(() => {
    const loadSession = async () => {
      const token = localStorage.getItem('access_token');
      if (token && !user) {
        try {
          const profile = await fetchUserProfile();
          if (profile?.email) {
            loginUser(profile);
            setCurrentUserData(profile);
          }
        } catch (err) {
          console.error('Ошибка восстановления сессии:', err);
        }
      }
    };
    loadSession();
  }, []); // только один раз

  // Навигация в зависимости от роли
  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'supervisor') setCurrentPage('supervisor');
      else if (role === 'analyst') setCurrentPage('analyst');
      else if (role === 'operator') setCurrentPage('main');
      else setCurrentPage('main');
    } else {
      setCurrentPage('register');
    }
  }, [user]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleLoginSuccess = (userData) => {
    loginUser(userData);
    setCurrentUserData(userData);
  };

  const handleLogout = () => {
    clearAllUserData(); // очищает токен и все ключи app_user_*
    logoutUser();
    setCurrentUserData(null);
    setCurrentPage('register');
  };

  const handleUserUpdate = (updatedData) => {
    const updated = { ...currentUserData, ...updatedData };
    loginUser(updated);   // обновляем контекст
    setCurrentUserData(updated); // локально
  };

  const renderPage = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка...</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'main':
        return <OperatorPage onLogout={handleLogout} userData={currentUserData} onUserUpdate={handleUserUpdate} />;
      case 'supervisor':
        return <SupervisorPage onLogout={handleLogout} userData={currentUserData} onUserUpdate={handleUserUpdate} />;
      case 'analyst':
        return <AnalystPage onLogout={handleLogout} userData={currentUserData} onUserUpdate={handleUserUpdate} />;
      case 'profile':
        return (
          <ProfilePage
            onBack={() => {
              if (currentUserData?.role === 'supervisor') setCurrentPage('supervisor');
              else if (currentUserData?.role === 'analyst') setCurrentPage('analyst');
              else setCurrentPage('main');
            }}
            onRegister={() => setCurrentPage('register')}
            userData={currentUserData}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
          />
        );
      case 'register':
        return <RegisterPage onBack={() => setCurrentPage('main')} onRegister={() => {}} onLoginSuccess={handleLoginSuccess} />;
      default:
        return <OperatorPage onLogout={handleLogout} userData={currentUserData} />;
    }
  };

  return (
    <div className="app-container">
      {currentPage !== 'register' && currentPage !== 'profile' && (
        <Header
          onPageChange={handlePageChange}
          currentPage={currentPage}
          userName={currentUserData?.name || currentUserData?.email}
          userData={currentUserData}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default App;