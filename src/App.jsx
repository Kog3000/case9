import { useState, useEffect } from 'react';
import Header from './Header/Header';
import ProfilePage from './ProfilePage/ProfilePage';
import './App.css';
import OperatorPage from './OperatorPage/OperatorPage';
import RegisterPage from './RegisterPage/RegisterPage';
import SupervisorPage from './SupervisorPage/SupervisorPage';
import AnalystPage from './AnalystPage';
import { useAuth } from './Context/AuthContext';

function App() {
  const { user, loading, loginUser, logoutUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('register');

  useEffect(() => {
    if (user) {
      const role = user.role;
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
    loginUser(userData);
  };

  const handleLogout = () => {
    logoutUser();
  };

  const renderPage = () => {
    if (loading) {
      return <div>Загрузка...</div>;
    }

    switch (currentPage) {
      case 'main':
        return <OperatorPage onLogout={handleLogout} userData={user} />;
      case 'supervisor':            // ← исправлено
        return <SupervisorPage onLogout={handleLogout} userData={user} />;
      case 'analyst':
        return <AnalystPage onLogout={handleLogout} userData={user} />;
      case 'profile':
        return (
          <ProfilePage
            onBack={() => {
              if (user?.role === 'supervisor') setCurrentPage('supervisor');
              else if (user?.role === 'analyst') setCurrentPage('analyst');
              else setCurrentPage('main');
            }}
            onRegister={() => setCurrentPage('register')}
            userData={user}
            onLogout={handleLogout}
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
        return <OperatorPage />;
    }
  };

  return (
    <div className="app-container">
      {currentPage !== 'register' && currentPage !== 'profile' && (
        <Header
          onPageChange={handlePageChange}
          currentPage={currentPage}
          userName={user?.role || user?.email}
          userData={user}
          onLogout={handleLogout}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default App;