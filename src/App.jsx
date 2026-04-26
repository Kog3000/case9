import { useState, useEffect } from 'react';
import Header from './Header/Header';
import ProfilePage from './ProfilePage/ProfilePage';
import './App.css';
import OperatorPage from './OperatorPage/OperatorPage';
import RegisterPage from './RegisterPage/RegisterPage';
import SupervisorPage from './SupervisorPage/SupervisorPage';
import AnalystPage from './AnalystPage';
import { useAuth } from './Context/AuthContext';
import { userStorage } from './Api/userStorageService.js';

function App() {
  const { user, loading, loginUser, logoutUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('register');
  const [currentUserData, setCurrentUserData] = useState(user);

  // Обновляем currentUserData при изменении user из контекста
  useEffect(() => {
    if (user) {
      setCurrentUserData(user);
    }
  }, [user]);

  // Загружаем сохраненные данные пользователя при монтировании
  useEffect(() => {
    const loadSavedUserData = async () => {
      const savedUserId = userStorage.getCurrentUserId();
      if (savedUserId && !user) {
        const savedData = userStorage.getUserData(savedUserId);
        if (savedData && loginUser) {
          // Восстанавливаем сессию, если есть сохраненные данные
          const restoredUser = {
            id: savedUserId,
            name: savedData.name,
            email: savedData.email,
            avatar: savedData.avatar,
            role: savedData.role
          };
          loginUser(restoredUser);
          setCurrentUserData(restoredUser);
        }
      }
    };
    loadSavedUserData();
  }, []);

  useEffect(() => {
    if (user) {
      const role = user.role;
      // Сохраняем данные пользователя в userStorage при входе
      const userId = user.id || user.user_id;
      if (userId) {
        userStorage.setCurrentUserId(userId);
        userStorage.setUserData(userId, {
          name: user.name || user.display_name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        });
      }

      // Навигация в зависимости от роли
      if (role === 'supervisor') {
        setCurrentPage('supervisor');
      } else if (role === 'analyst') {
        setCurrentPage('analyst');
      } else if (role === 'operator') {
        setCurrentPage('main');
      } else if (role === 'tester') {
        setCurrentPage('tester');
      } else {
        setCurrentPage('main');
      }
    } else {
      setCurrentPage('register');
    }
  }, [user]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = (userData) => {
    // Сохраняем ID пользователя при успешном входе
    const userId = userData.id || userData.user_id;
    if (userId) {
      userStorage.setCurrentUserId(userId);
      userStorage.setUserData(userId, {
        name: userData.name || userData.display_name,
        email: userData.email,
        avatar: userData.avatar,
        role: userData.role
      });
    }
    loginUser(userData);
    setCurrentUserData(userData);
  };

  const handleLogout = () => {
    // Очищаем данные пользователя при выходе
    const userId = userStorage.getCurrentUserId();
    if (userId) {
      // Опционально: можно оставить данные пользователя для следующего входа
      // userStorage.clearUserData(userId);
      userStorage.setCurrentUserId(null);
    }
    logoutUser();
    setCurrentUserData(null);
    setCurrentPage('register');
  };

  const handleUserUpdate = (updatedData) => {
    // Обновляем данные пользователя
    const userId = userStorage.getCurrentUserId();
    if (userId) {
      userStorage.updateUserData(userId, updatedData);
    }
    
    // Обновляем локальное состояние
    setCurrentUserData(prev => {
      const updated = { ...prev, ...updatedData };
      
      // Обновляем данные в контексте, если есть такая возможность
      if (loginUser) {
        loginUser(updated);
      }
      
      return updated;
    });
  };

  const renderPage = () => {
    if (loading) {
      return <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>;
    }

    switch (currentPage) {
      case 'main':
        return (
          <OperatorPage 
            onLogout={handleLogout} 
            userData={currentUserData}
            onUserUpdate={handleUserUpdate}
          />
        );
      case 'supervisor':
        return (
          <SupervisorPage 
            onLogout={handleLogout} 
            userData={currentUserData}
            onUserUpdate={handleUserUpdate}
          />
        );
      case 'analyst':
        return (
          <AnalystPage 
            onLogout={handleLogout} 
            userData={currentUserData}
            onUserUpdate={handleUserUpdate}
          />
        );
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
        return (
          <RegisterPage
            onBack={() => setCurrentPage('main')}
            onRegister={() => setCurrentPage('register')}
            onLoginSuccess={handleLoginSuccess}
          />
        );
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