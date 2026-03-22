import { useState, useEffect } from 'react'
import Header from './Header/Header'
import ProfilePage from './ProfilePage/ProfilePage'
import './App.css'
import OperatorPage from './OperatorPage/OperatorPage'
import RegisterPage from './RegisterPage/RegisterPage'
import SupervizerPage from './SupervizerPage'

function App() {
  const [currentPage, setCurrentPage] = useState('register')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState(null)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated')
    const savedUserName = localStorage.getItem('userName')
    const savedUserData = localStorage.getItem('userData')
    
    if (savedAuth === 'true' && savedUserName && savedUserData) {
      setIsAuthenticated(true)
      setUserName(savedUserName)
      setUserData(JSON.parse(savedUserData))
      
      if (savedUserName === 'supervizer') {
        setCurrentPage('supervizer')
      } else {
        setCurrentPage('main')
      }
    }
  }, [])

  const handlePageChange = (page) => {
    console.log('handlePageChange вызван:', page)
    setCurrentPage(page)
  }

  const handleLoginSuccess = (user) => {
    console.log('Успешный вход:', user)
    setIsAuthenticated(true)
    setUserName(user.name)
    setUserData(user)
    
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userName', user.name)
    localStorage.setItem('userLogin', user.login)
    localStorage.setItem('userDisplayName', user.displayName)
    localStorage.setItem('userEmail', user.email)
    localStorage.setItem('userData', JSON.stringify(user))
    
    if (user.name === 'supervizer') {
      setCurrentPage('supervizer')
    } else {
      setCurrentPage('main')
    }
  }

  const handleLogout = () => {
    console.log('=== ВЫХОД ИЗ СИСТЕМЫ ===')
    console.log('Очищаем все данные')
    setIsAuthenticated(false)
    setUserName(null)
    setUserData(null)
    
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userLogin')
    localStorage.removeItem('userName')
    localStorage.removeItem('userDisplayName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userData')
    
    console.log('Переходим на страницу регистрации')
    setCurrentPage('register')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return <OperatorPage onLogout={handleLogout} userData={userData} />
      case 'supervizer':
        return <SupervizerPage onLogout={handleLogout} userData={userData} />
      case 'profile':
        return (
          <ProfilePage 
            onBack={() => {
              console.log('Возврат на главную')
              handlePageChange(userName === 'supervizer' ? 'supervizer' : 'main')
            }} 
            onRegister={() => handlePageChange('register')}
            userData={userData}
            onLogout={handleLogout}
          />
        )
      case 'register':
        return (
          <RegisterPage 
            onBack={() => handlePageChange('main')}
            onRegister={() => handlePageChange('register')}
            onLoginSuccess={handleLoginSuccess}
          />
        )
      default:
        return <OperatorPage />
    }
  }

  return (
    <div className="app-container">
      {currentPage !== 'register' && currentPage !== 'profile' && (
        <Header 
          onPageChange={handlePageChange} 
          currentPage={currentPage} 
          userName={userName}
          userData={userData}
          onLogout={handleLogout}
        />
      )}
      {renderPage()}
    </div>
  )
}

export default App